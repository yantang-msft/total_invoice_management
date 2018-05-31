# total_invoice_managment
## a Kubernetes tutorial

Original repo accompanies a [blog post](https://medium.com/@MostlyHarmlessD/getting-started-with-microservices-and-kubernetes-76354312b556). I have modified it to use Helm for deployment.

## Configure deployment environment

If using minikube, switch to the built-in Docker daemon:
```
eval $(minikube docker-env)
```
(this affects the current shell only).

## Build Docker images

```
cd <REPO ROOT>/invoices_svc
npm install
docker build . -t invoices_svc:v1

cd ../expected_date_svc
npm install
docker build . -t expected_date_svc:v1

cd ../auth_svc
npm install
docker build . -t auth_svc:v1
```

## Deploy
```
cd ../kube
helm install total_invoice --name total-invoice-rel 
```

The default Kubernetes namespace to deploy into is `total-invoice`. 
If a different namespace is desired, override the "namespace" value 
(pass `--set 'namespace=other-namespace'` to `helm install`).

To learn what the entry URL is:

```
 minikube service ambassador-svc --url --namespace total-invoice
```

To delete the deployment

```
helm del --purge total-invoice-rel
```
