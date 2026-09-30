[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Archive)
$ErrorActionPreference = 'Stop'
$Archive = (Resolve-Path -LiteralPath $Archive).Path
$expected = (Get-Content -LiteralPath ($Archive + '.sha256') -Raw).Split(' ')[0].Trim()
if ($expected -notmatch '^[a-f0-9]{64}$' -or (Get-FileHash -LiteralPath $Archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { throw 'Archive SHA-256 mismatch.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($Archive)
try {
    $names = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    [long]$size = 0
    foreach ($entry in $zip.Entries) {
        $name = $entry.FullName
        if ($name -match '(^/|\\|:|(^|/)\.\.?(/|$)|[<>"|?*])' -or -not $names.Add($name) -or (($entry.ExternalAttributes -shr 16) -band 0xF000) -eq 0xA000) { throw "Unsafe or duplicate package entry: $name" }
        $size += $entry.Length
        if ($size -gt 536870912 -or $names.Count -gt 10000) { throw 'Package exceeds the supported archive size.' }
    }
    $entry = $zip.GetEntry('PACKAGE.json')
    if (-not $entry -or $entry.Length -gt 16777216) { throw 'PACKAGE.json is missing or too large.' }
    $reader = [IO.StreamReader]::new($entry.Open())
    try { $package = $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
    if ($package.schema -ne 1 -or $package.version -notmatch '^\d+\.\d+\.\d+$' -or -not $package.files) { throw 'Invalid package manifest.' }
    $listed = @($package.files.PSObject.Properties)
    if ($names.Count -ne $listed.Count + 1) { throw 'Archive inventory differs from PACKAGE.json.' }
    foreach ($file in $listed) {
        $entry = $zip.GetEntry($file.Name)
        if (-not $entry -or $file.Value -notmatch '^[a-f0-9]{64}$') { throw "Missing or invalid package file: $($file.Name)" }
        $stream = $entry.Open(); $sha = [Security.Cryptography.SHA256]::Create()
        try { $actual = -join ($sha.ComputeHash($stream) | ForEach-Object { $_.ToString('x2') }) } finally { $stream.Dispose(); $sha.Dispose() }
        if ($actual -ne $file.Value) { throw "Package file hash mismatch: $($file.Name)" }
    }
} finally { $zip.Dispose() }
$probe = Join-Path ([IO.Path]::GetTempPath()) ('bfs package ' + [guid]::NewGuid())
[IO.Directory]::CreateDirectory($probe) | Out-Null
$source = Join-Path $probe 'source'
[IO.Compression.ZipFile]::ExtractToDirectory($Archive,$source)
$plugin = Join-Path $source 'plugins/bontaflowstack'
$manifest = Get-Content -LiteralPath (Join-Path $plugin '.codex-plugin/plugin.json') -Raw | ConvertFrom-Json
$catalog = Get-Content -LiteralPath (Join-Path $plugin 'catalog.json') -Raw | ConvertFrom-Json
if ($manifest.version -ne $package.version -or $catalog.version -ne $package.version) { throw 'Package versions disagree.' }
$oldState = $env:BFS_STATE_HOME; $oldTask = $env:CODEX_THREAD_ID
try {
    $env:BFS_STATE_HOME = Join-Path $probe 'state'; $env:CODEX_THREAD_ID = $null
    Push-Location $probe
    try {
        $listing = & powershell.exe -NoProfile -File (Join-Path $plugin 'scripts/bfstack.ps1') -Command catalog -Action list | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or $listing.skills.Count -ne $catalog.skills.Count) { throw 'Extracted catalog failed.' }
        $read = & node (Join-Path $plugin 'core/cli.mjs') read bfs-router | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or -not $read.host -or -not $read.instructions) { throw 'Extracted read failed.' }
        $doctor = & node (Join-Path $plugin 'core/cli.mjs') doctor | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or -not $doctor.core.ready -or $doctor.engines.installed) { throw 'Extracted core doctor failed.' }
        $qa = & node (Join-Path $plugin 'core/cli.mjs') doctor bfs-qa | ConvertFrom-Json
        if ($LASTEXITCODE -ne 1 -or $qa.ready -or $qa.missing -notcontains 'browser') { throw 'Missing browser was not reported.' }
    } finally { Pop-Location }
} finally { $env:BFS_STATE_HOME = $oldState; $env:CODEX_THREAD_ID = $oldTask }
@{status='completed';archive=$Archive;version=$package.version;dirty=$package.dirty;files=$listed.Count;extracted=$source;scope='ZIP inventory, hashes, versions and extracted entrypoints; no native-hook trust or optional-engine claim'} | ConvertTo-Json -Compress
exit 0
