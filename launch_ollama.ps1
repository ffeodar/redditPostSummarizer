#Downloading and installing Ollama
Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "OllamaSetup.exe"
Start-Process -FilePath "OllamaSetup.exe" -ArgumentList "/S" -Wait

#Downloading LLMs
ollama pull gemma3:270m
ollama pull gemma3:1b

#Stopping Ollama
Get-Process | Where-Object {$_.ProcessName -like '*ollama*'} | Stop-Process

#Setting environmental variables and starting Ollama
$env:OLLAMA_ORIGINS="chrome-extension://*"
ollama serve