# Usage: .\scripts\build-all.ps1 -Tag manual
param([string]$Tag = "manual")
foreach ($s in "calculator","sum","sub","mul","div") {
  docker build -t "calc-$($s):$Tag" "services/$s"
  if ($LASTEXITCODE -ne 0) { exit 1 }
}
