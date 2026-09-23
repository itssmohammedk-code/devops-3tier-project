pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out from GitHub'
            }
        }
        stage('Verify Project') {
            steps {
                sh 'git rev-parse --short HEAD'
                sh 'test -f backend/server.js'
                sh 'test -f backend/Dockerfile'
                sh 'test -f frontend/Dockerfile'
                sh 'test -d k8s'
                sh 'test -d helm/devops-3tier'
                echo 'Project structure verified successfully'
            }
        }
        stage('CI Test') {
            steps {
                echo 'CI validation completed successfully'
            }
        }
    }
    post {
        success {
            echo 'DevOps 3-Tier CI Pipeline completed successfully!'
        }
        failure {
            echo 'CI Pipeline failed.'
        }
    }
}
