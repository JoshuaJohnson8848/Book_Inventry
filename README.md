CI/CD Pipeline Setup for Node.js App with Jenkins and Docker
This document outlines the steps to set up a CI/CD pipeline for a Node.js application (e.g., Book_Inventry) using Jenkins and Docker on an EC2 instance. The pipeline builds a Docker image for the Node app, deploys it as a container, and uses Jenkins to automate the process, triggered by GitHub push events via a webhook.
Prerequisites

An AWS EC2 instance (e.g., Ubuntu 22.04 LTS) with:
Security group allowing ports 22 (SSH), 8080 (Jenkins), and 3000 (Node app).
Docker installed (docker.io or docker-ce).


A GitHub repository (e.g., Github Link).
Ngrok installed for exposing Jenkins to GitHub webhooks.
Basic knowledge of Docker, Jenkins, and Git.

Pipeline Flow
1. Create Docker Image for the Node App

Ensure your Node.js app has a Dockerfile in the repository root (e.g., Book_Inventry).
Example Dockerfile:FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]


The Jenkinsfile will build the image using docker build.

2. Run the Node App Container

The pipeline deploys the app as a Docker container, mapping port 3000 (or your app’s port) to avoid conflicts with Jenkins (port 8080).
Example command (handled by Jenkinsfile):docker run -d -p 3000:3000 --name book_inventry book_inventry



3. Set Up Jenkins Container

Run a Jenkins container with Docker socket and volume mounts to persist data and allow Docker commands.

Command:docker run -d --name jenkins-docker -u root \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  -p 8080:8080 -p 50000:50000 \
  jenkins/jenkins:lts


Note: Running as root simplifies permissions but is less secure. For production, consider using the jenkins user with proper group settings.

4. Install Docker CLI in Jenkins Container

Enter the Jenkins container to install the Docker CLI for running Docker commands.

Command:docker exec -it jenkins-docker bash


Install Docker CLI:apt-get update
apt-get install -y docker.io


Verify installation:docker --version



5. Access Jenkins Dashboard

Visit http://<ec2-public-ip>:8080 to access the Jenkins dashboard.
Retrieve the initial admin password:docker exec jenkins-docker cat /var/jenkins_home/secrets/initialAdminPassword


Log in with the password, reset it, and install suggested plugins during setup.

6. Configure the Jenkins Pipeline

Create a new pipeline job (e.g., “book_inventry”).
Configure:
Source Code Management: Git
Repository URL: Github Link
Branch: */master (or */main)


Build Triggers: Check GitHub hook trigger for GITScm polling
Pipeline: Pipeline script from SCM, Script Path: Jenkinsfile



7. Create Jenkinsfile

Add a Jenkinsfile to the root of your Node app repository (Book_Inventry).
Example Jenkinsfile:pipeline {
    agent any
    stages {
        stage('Clone repository') {
            steps {
                git 'Github Link'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t book_inventry .'
                }
            }
        }
        stage('Stop and Remove Old Container') {
            steps {
                script {
                    sh '''
                        docker stop book_inventry || true
                        docker rm book_inventry || true
                    '''
                }
            }
        }
        stage('Run New Container') {
            steps {
                script {
                    sh 'docker run -d -p 3000:3000 --name book_inventry book_inventry'
                }
            }
        }
    }
}


Commit and push:git add Jenkinsfile
git commit -m "Add Jenkinsfile for CI/CD"
git push origin master



8. Set Up Ngrok for Webhook

Start an ngrok tunnel to expose Jenkins:ngrok http 8080


Copy the ngrok URL (e.g., https://<random>.ngrok-free.app).
Run ngrok in a persistent session (e.g., using screen):screen
ngrok http 8080


Detach with Ctrl+A, D.



9. Configure GitHub Webhook

In your GitHub repository (Github Link):
Go to Settings > Webhooks > Add webhook.
Payload URL: https://<ngrok-url>.ngrok-free.app/github-webhook/
Content type: application/json
Events: Select Just the push event
Active: Check to enable


Save and test the webhook (should return 200 OK).

Testing the Pipeline

Make a test commit to the repository:echo "Test webhook" >> README.md
git add README.md
git commit -m "Test webhook trigger"
git push origin master


Verify the webhook triggers the Jenkins pipeline:
Check Recent Deliveries in GitHub for a 200 OK response.
Confirm the “book_inventry” job runs in Jenkins.


Access the app at http://<ec2-public-ip>:3000.

Troubleshooting

Webhook Fails:
Ensure ngrok is running and the URL matches the webhook.
Check EC2 security group allows port 8080.

Verify Jenkins logs:sudo cat /var/log/jenkins/jenkins.log




Pipeline Not Triggering:
Confirm GitHub hook trigger is enabled in the job.
Check repository branch and Jenkinsfile path.


Port Conflicts:
Ensure no other process uses port 8080 or 3000:sudo netstat -tulnp | grep 8080
sudo netstat -tulnp | grep 3000




Docker Permissions:
Verify the jenkins user can run Docker:docker exec -u jenkins jenkins-docker docker ps





Notes

This setup uses a Dockerized Jenkins instance, which may introduce complexities (e.g., Docker CLI installation, socket permissions). For simpler setups, consider installing Jenkins directly on the EC2 instance.
Ngrok free-tier URLs are temporary. For production, use the EC2 public IP or a static domain.
Document this setup for your team, as you’re pioneering Docker use in your company.

