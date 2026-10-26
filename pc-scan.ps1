# TheTwoKings hardware inventory. Read-only; writes only the selected JSON file.
# No serial numbers, usernames, hostnames, network addresses, or credentials.
param([string]$OutputPath = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'thetwokings-pc.json'))
$ErrorActionPreference = 'Stop'
$report = [ordered]@{
  schemaVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString('o')
  cpu = @(Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors)
  gpu = @(Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion)
  ram = @(Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, PartNumber, Capacity, Speed, ConfiguredClockSpeed)
  board = @(Get-CimInstance Win32_BaseBoard | Select-Object Manufacturer, Product)
  disks = @(Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size, BusType)
}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Host "Hardwarebericht gespeichert: $OutputPath"
Write-Host 'Die Datei wird nicht hochgeladen. Importiere sie bei Bedarf in die PC-Werkstatt.'
