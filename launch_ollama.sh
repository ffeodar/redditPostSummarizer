#Installing Ollama
curl -fsSL https://ollama.com/install.sh | sh

#Downloading LLM
ollama pull gemma3:1b

#Setting environmental variables and starting Ollama
OLLAMA_ORIGINS=chrome-extension://* 
ollama serve
