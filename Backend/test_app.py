import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_message_endpoint(client):
    response = client.get('/api/message')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'message' in json_data
    assert json_data['message'] == "Hello, DevOps CI/CD!"

def test_health_endpoint(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'status' in json_data
    assert json_data['status'] == "healthy"
