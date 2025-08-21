#Setting environmental variables
$env:OLLAMA_ORIGINS="chrome-extension://*"

#Downloading and installing Ollama
Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "OllamaSetup.exe"
Start-Process -FilePath "OllamaSetup.exe" -ArgumentList "/S" -Wait

#Downloading LLM and starting Ollama
ollama pull gemma3:1b
ollama serve