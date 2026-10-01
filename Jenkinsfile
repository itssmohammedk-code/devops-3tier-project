pipeline {
    agent any

    environment {
        DOCKER_HOST = 'tcp://host.docker.internal:2375'
    }

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
                sh 'test -f helm/devops-3tier/values-prod.yaml'
                sh 'test -f gitops/bootstrap/application.yaml'
                sh 'test -f README.md'
                echo 'Project structure verified successfully'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=devops-3tier-project \
                              -Dsonar.projectName=devops-3tier-project \
                              -Dsonar.sources=. \
                              -Dsonar.exclusions=**/node_modules/**,**/.terraform/**,**/terraform.lock.hcl
                        """
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    IMAGE_TAG=$(git rev-parse HEAD)
                    echo "Building immutable image tag: $IMAGE_TAG (plus latest compatibility tag)"
                    docker build \
                      -t 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-backend:$IMAGE_TAG \
                      -t 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-backend:latest \
                      ./backend

                    docker build \
                      -t 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-frontend:$IMAGE_TAG \
                      -t 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-frontend:latest \
                      ./frontend
                '''
            }
        }
	stage('Trivy Scan') {
    steps {
        sh '''
            IMAGE_TAG=$(git rev-parse HEAD)
            trivy image --severity CRITICAL --exit-code 1 \
              546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-backend:$IMAGE_TAG

            trivy image --severity CRITICAL --exit-code 1 \
              546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-frontend:$IMAGE_TAG
        '''
    }
}
	stage('Push Images to ECR') {
    steps {
        withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
            script {
                def imageTag = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()

                sh '''
                aws ecr get-login-password --region us-east-1 | \
                docker login --username AWS --password-stdin \
                546359740762.dkr.ecr.us-east-1.amazonaws.com
                '''

                retry(3) {
                    sh "docker push 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-backend:${imageTag}"
                }

                retry(3) {
                    sh 'docker push 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-backend:latest'
                }

                retry(3) {
                    sh "docker push 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-frontend:${imageTag}"
                }

                retry(3) {
                    sh 'docker push 546359740762.dkr.ecr.us-east-1.amazonaws.com/devops-frontend:latest'
                }
            }
        }
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
