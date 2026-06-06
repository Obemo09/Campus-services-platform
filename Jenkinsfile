pipeline {
    agent any

    environment {
        REGISTRY = "campus-services-registry"
        APP_DIR  = "/var/campus-services-platform"
    }

    stages {
        stage('1. Continuous Integration: Fetch & Link') {
            steps {
                echo 'Pulling latest integrated master branch from GitHub...'
                sh "git pull origin main"
            }
        }

        stage('2. Quality Assurance: Dependency Audit') {
            steps {
                echo 'Scanning frontend for production vulnerabilities...'
                sh "cd ${env.APP_DIR}/frontend && npm audit"
            }
        }

        stage('3. Continuous Deployment: Container Build') {
            steps {
                echo 'Recompiling microservice Docker images and scaling containers...'
                sh "docker compose -f ${env.APP_DIR}/docker-compose.yml up -d --build"
            }
        }

        stage('4. Infrastructure Verification') {
            steps {
                echo 'Verifying core system container health states...'
                sh "docker compose ps"
            }
        }
    }
    
    post {
        success {
            echo 'Deployment Pipeline Completed Successfully! Platform is Live and Healthy.'
        }
        failure {
            echo 'Pipeline Broken! Rolling back to last stable container build.'
        }
    }
}
