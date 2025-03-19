from django.contrib.auth import login, logout
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from rest_framework.authtoken.models import Token
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError

"""
Filename: views.py
Author: Pranav Pawar
Description: user views
"""

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_user(request):
    """Test endpoint to verify user authentication and fetch user details."""
    serializer = UserSerializer(request.user)
    return Response({'user': serializer.data}, status=status.HTTP_200_OK)

class UserRegister(APIView):
    """API endpoint for user registration."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            clean_data = custom_validation(request.data)
        except ValidationError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    """API endpoint for user login."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        data = request.data

        # Validate email and password
        if not validate_email(data):
            return Response({"message": "Invalid email format."}, status=status.HTTP_400_BAD_REQUEST)

        if not validate_password(data):
            return Response({"message": "Password must meet complexity requirements."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid():
            user = serializer.check_user(data)

            # Regenerate token on login
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)

            login(request, user)

            user_data = UserSerializer(user).data  # Include user details in response
            return Response({"token": token.key, "user": user_data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogout(APIView):
    """API endpoint for user logout."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = Token.objects.get(user=request.user)
            token.delete()
        except Token.DoesNotExist:
            return Response({"detail": "Token not found or already invalidated."}, status=status.HTTP_400_BAD_REQUEST)

        logout(request)
        return Response({"detail": "Successfully logged out and token invalidated."}, status=status.HTTP_200_OK)

"""
Author :- Chirag Patil
Description:- API endpoint that retrieves and returns the details of the currently authenticated user.

"""
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    """API to fetch details of the currently authenticated user."""
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)
