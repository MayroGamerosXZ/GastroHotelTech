from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_status():
    """Prueba de Integracion: Verificar que el servidor backend responde."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to GastroHotel Tech API"}
