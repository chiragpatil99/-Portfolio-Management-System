from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import UserPreference
from rest_framework.test import APIClient

'''
Arnav Taya
Created Sprint 3
'''
class CheckVolatilityTestCase(TestCase):
    def setUp(self):
        # Get the custom user model
        User = get_user_model()

        # Create a test user (provide email as it's required)
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpass'
        )

        # Create a UserPreference for the test user
        self.preference = UserPreference.objects.create(
            user=self.user,
            symbol='AAPL',
            volatility_threshold=0.02
        )

        # Authenticate the user for the API client
        self.client = APIClient()
        self.client.login(username='testuser', password='testpass')

    def test_check_volatility(self):
        response = self.client.get('/check-volatility/', format='json')
        print(response.content)
        print(response.status_code)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)  # Check if the response is a list
        if response.data:
            self.assertIn('symbol', response.data[0])
            self.assertIn('volatility', response.data[0])
    
