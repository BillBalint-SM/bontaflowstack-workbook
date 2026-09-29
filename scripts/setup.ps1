[CmdletBinding()]
param([switch]$WithEngines, [switch]$InstallPrerequisites, [switch]$InstallPlugin)
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
& (Join-Path $repoRoot 'plugins/bontaflowstack/scripts/setup.ps1') -WithEngines:$WithEngines -InstallPrerequisites:$InstallPrerequisites
if ($LASTEXITCODE -ne 0) { throw 'Setup failed.' }
if ($InstallPlugin) {
    if (-not (Get-Command codex -ErrorAction SilentlyContinue)) { throw 'Add the Codex CLI to PATH, or install this repository through Codex Desktop Plugins.' }
    & codex plugin marketplace add $repoRoot
    if ($LASTEXITCODE -ne 0) { throw 'Could not register the local marketplace.' }
    & codex plugin add bontaflowstack@bontaflowstack
    if ($LASTEXITCODE -ne 0) { throw 'Could not install the plugin.' }
    Write-Host 'Start a new Codex chat and use $bfs-driver.'
}
