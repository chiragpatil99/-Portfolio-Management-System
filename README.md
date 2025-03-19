# Portfolio Management System

A comprehensive system to manage portfolios with a **Django backend** and a **React frontend**, orchestrated using **Docker** for seamless deployment. 

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Setup Instructions](#setup-instructions)
6. [Folder Structure ](#folder-structure)

---

## Project Overview

The Portfolio Management System allows users to track, analyze, and manage financial portfolios effectively. The backend handles data storage, processing, and API services using **Django**, while the frontend provides an intuitive interface using **React**. 

The system leverages **Docker** for environment consistency, including a setup for backend, frontend, and **Nginx** for reverse proxy.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker** and **Docker Compose**
- **Node.js** (for local frontend development)
- **Python 3.11** and **pip** (for local backend development)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://gitlab.com/pranav1099/portfolio-management-system.git
cd portfolio-management-system
```
### 2. Install backend requirements after creating a virtual environment

```bash
python -m venv venv
.venv/Scripts/activate
pip install -r requirements.txt
```

### 3. Install frontend requirements with npm

```bash
npm install
```

## Features

- User authentication and authorization.
- Manage portfolios with CRUD operations.
- Real-time data visualization and analysis.
- Celery based scheduler for volatility checks based on user preference
- Responsive design for multiple devices.
- Dockerized environment for easy deployment.
- Deployed on AWS with AWS RDS Postgres DB.

---

Use the following command to spin up the application on local

```bash
docker-compose -f docker-compose.yml up --build
```
Once the docker containers are up go to local host and create a user by signing up and use the following command to simulate dummy stock data for the user if needed

```bash
docker-compose -f docker-compose.yml exec web python manage.py simulate_stock_data
```

## Folder Structure

### 1. Backend folder has the following apps

 - Portfolio : main app to bootstrap the django application
 - users : Custom User model and logic for token and session based authentication
 - asset : Our Api solutions using Yfinance
 - entrypoint: script for precursor activities for backend container


### 2. Frontend folder has the following folders

- components : individual reusable components for UI elements such as 
    -   Graphs
    -   Report Dashboard
    -   Landinganimation
    -   Signin and Signup screens
    -   Transaction Form and Graph
    -   Volaitlity, Risk Assessment, Market Value, Profit Loss Percentage Screens
    -   Alert Datatable
- store :  Redux Setup
- services : axios fetch apis to get responses from backend

### 3. Docker Deployment

- docker/backend => backend django docker file along with frontend build copy step
- docker/nginx => middleware nginx docker file
- docker-compose.yml => containers for local deployemnt using postgres image for db
- docker-compose.prod.yml => containers for aws deployemnt using aws rds db
- .env.local => local db settings
- .env.prod => aws rds db settings


