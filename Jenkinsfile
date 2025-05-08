pipeline {
    agent any

    stages {
        stage('Clone repository') {
            steps {
                git 'https://github.com/JoshuaJohnson8848/Book_Inventry.git'
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
                    sh 'docker run -d -p 8080:8080 --name book_inventry book_inventry'
                }
            }
        }
    }
}
