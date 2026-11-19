# tts_sapi.ps1 — Ubah daftar teks (JSON) menjadi file WAV memakai suara Windows (System.Speech).
# Pemakaian: powershell -File tts_sapi.ps1 -List items.json -OutDir folder
param([string]$List, [string]$OutDir, [string]$Voice = 'Microsoft Zira Desktop', [int]$Rate = -1)
Add-Type -AssemblyName System.Speech
$items = Get-Content -Raw -Encoding UTF8 $List | ConvertFrom-Json
New-Item -ItemType Directory -Force $OutDir | Out-Null
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $s.SelectVoice($Voice) } catch { }
$s.Rate = $Rate
foreach ($it in $items) {
  $path = Join-Path $OutDir ($it.id + '.wav')
  $s.SetOutputToWaveFile($path)
  $s.Speak([string]$it.text)
}
$s.SetOutputToNull()
$s.Dispose()
Write-Output ("OK " + $items.Count)
