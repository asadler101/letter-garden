param([string]$ProjectRoot = $PSScriptRoot)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $english = $voice.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'en-US' }
  $preferred = $english | Where-Object { $_.VoiceInfo.Name -match 'Zira' } | Select-Object -First 1
  if (-not $preferred) { $preferred = $english | Select-Object -First 1 }
  if (-not $preferred) { throw 'Install an English US Windows speech voice before regenerating recordings.' }
  $voice.SelectVoice($preferred.VoiceInfo.Name)
  $voice.Rate = -2
  $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
  $manifest = Get-Content -LiteralPath (Join-Path $ProjectRoot 'audio/manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($entry in $manifest.PSObject.Properties) {
    $output = Join-Path $ProjectRoot ('audio/' + $entry.Name + '.wav')
    $voice.SetOutputToWaveFile($output, $format)
    $voice.Speak($entry.Value)
  }
  $voice.SetOutputToNull()
  Write-Output ('Generated ' + @($manifest.PSObject.Properties).Count + ' recordings without speaker playback.')
} finally { $voice.Dispose() }
