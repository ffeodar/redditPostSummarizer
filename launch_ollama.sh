if command -v ollama >/dev/null 2>&1; then
    echo "Ollama is installed"
else
    curl -fsSL https://ollama.com/install.sh | sh
fi
sudo systemctl stop ollama.service
sudo systemctl disable ollama.service
sudo systemctl stop ollama
sudo pkill ollama
sudo killall ollama
ollama pull gemma3:1b 
OLLAMA_ORIGINS=chrome-extension://* ollama serve
