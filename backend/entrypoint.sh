#!/bin/sh
#
#     Author: Pranav Pawar
#     Description: calculate time series
# 
echo "Starting entrypoint script..."
set -

echo "Starting entrypoint script..."
set -e

# Check if ENV is set to local
if [ "$ENV" = "local" ]; then
  echo "ENV is set to local. Waiting for the database to be ready..."
  while ! nc -z db 5432; do
    echo "Database is unavailable - sleeping"
    sleep 2
  done
  echo "Database is up!"
else
  echo "ENV is not set to local. Skipping database check."
fi

# echo "Flushing database..."
# python manage.py flush --no-input

# echo "Making migrations..."
# python manage.py makemigrations --merge --noinput
python manage.py makemigrations --noinput

# echo "Applying migrations..."
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "Executing final command: $@"
exec "$@"
