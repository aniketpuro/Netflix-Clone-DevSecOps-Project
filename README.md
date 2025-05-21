# 🚀 Netflix Clone Deployment on AWS Using Jenkins – DevSecOps Project

A comprehensive project demonstrating a **CI/CD pipeline** with integrated **security tools** like **SonarQube**, **Trivy**, and **OWASP Dependency-Check**, along with **monitoring using Prometheus and Grafana**.

---

## 🌐 Phase 1: Initial Setup and Deployment

### 🔹 Step 1: Launch EC2 Instance

* Launch an Ubuntu 22.04 EC2 instance from AWS.
* SSH into the instance:

  ```bash
  ssh -i <your-key.pem> ubuntu@<your-ec2-public-ip>
  ```

### 🔹 Step 2: Clone Application Code

```bash
sudo apt update && sudo apt upgrade -y
git clone https://github.com/aniketpuro/Netflix-Clone-DevSecOps-Project.git
cd DevSecOps-Project
```

### 🔹 Step 3: Install Docker and Run App

```bash
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER
newgrp docker
sudo chmod 777 /var/run/docker.sock

# Build and run the container (will need API key)
docker build -t netflix .
docker run -d --name netflix -p 8081:80 netflix:latest
```

### 🔹 Step 4: Generate TMDB API Key

* Create a TMDB account → Profile → Settings → API → Generate API Key.
* Rebuild Docker image:

  ```bash
  docker build --build-arg TMDB_V3_API_KEY=<your-api-key> -t netflix .
  ```

---

## 🔐 Phase 2: Security Tools Setup

### 🔹 Install SonarQube

```bash
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
```

* Access: `http://<public-ip>:9000`
* Default login: `admin / admin`

### 🔹 Install Trivy

```bash
sudo apt-get install wget apt-transport-https gnupg lsb-release -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy -y
```

* Scan image:

  ```bash
  trivy image <image-id>
  ```

---

## 🔁 Phase 3: CI/CD Setup with Jenkins

### 🔹 Install Java & Jenkins

```bash
sudo apt install fontconfig openjdk-17-jre -y
java -version

# Jenkins Installation
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins -y
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

* Access: `http://<public-ip>:8080`

### 🔹 Install Jenkins Plugins

Install via `Manage Jenkins > Plugin Manager`:

* Eclipse Temurin Installer
* SonarQube Scanner
* NodeJS Plugin
* Email Extension Plugin
* OWASP Dependency-Check
* Docker Pipeline, Docker Commons, Docker API, docker-build-step

### 🔹 Configure Tools

* `Global Tool Configuration`:

  * JDK (17)
  * NodeJS (16)
  * SonarQube Scanner (add name `sonar-scanner`)
  * OWASP Dependency-Check (name: `DP-Check`)

* Add SonarQube Token:

  * `Manage Jenkins → Credentials → Add → Secret Text`

* Add DockerHub Credentials:

  * ID: `docker`
  * Username & Password

### 🔹 Jenkinsfile for CI/CD Pipeline

```groovy
pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/N4si/DevSecOps-Project.git'
            }
        }
        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=Netflix \
                    -Dsonar.projectKey=Netflix'''
                }
            }
        }
        stage("Quality Gate") {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('OWASP Scan') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('Trivy FS Scan') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
        stage("Docker Build & Push") {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh "docker build --build-arg TMDB_V3_API_KEY=<yourapikey> -t netflix ."
                        sh "docker tag netflix nasi101/netflix:latest"
                        sh "docker push nasi101/netflix:latest"
                    }
                }
            }
        }
        stage("Trivy Image Scan") {
            steps {
                sh "trivy image nasi101/netflix:latest > trivyimage.txt"
            }
        }
        stage("Deploy App") {
            steps {
                sh "docker run -d --name netflix -p 8081:80 nasi101/netflix:latest"
            }
        }
    }
}
```

### 🔧 Fix Docker Permission Error

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

---

## 📊 Phase 4: Monitoring Setup

### 🔹 Install Prometheus

```bash
sudo useradd --system --no-create-home --shell /bin/false prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.47.1/prometheus-2.47.1.linux-amd64.tar.gz
tar -xvf prometheus-2.47.1.linux-amd64.tar.gz
cd prometheus-2.47.1.linux-amd64/
sudo mkdir -p /data /etc/prometheus
sudo mv prometheus promtool /usr/local/bin/
sudo mv consoles/ console_libraries/ /etc/prometheus/
sudo mv prometheus.yml /etc/prometheus/prometheus.yml
sudo chown -R prometheus:prometheus /data /etc/prometheus
```

### 🔹 Install Grafana (optional next step)

Let me know if you'd like instructions for installing Grafana as well.

---

## ✅ Summary

| Tool           | Purpose                          |
| -------------- | -------------------------------- |
| **Docker**     | Containerization                 |
| **Jenkins**    | CI/CD Automation                 |
| **SonarQube**  | Code Quality & Security Analysis |
| **Trivy**      | Container Vulnerability Scanning |
| **OWASP DC**   | Dependency Security Scan         |
| **Prometheus** | Metrics Collection               |
| **Grafana**    | Visualization & Monitoring       |

---

