
REPO = yanmingacr.azurecr.io/

build:
	docker build . -f invoices_svc/Dockerfile -t $(REPO)invoices_svc
	docker build . -f expected_date_svc/Dockerfile -t $(REPO)expected_date_svc
	docker build . -f auth_svc/Dockerfile -t $(REPO)auth_svc
	docker build . -f audit_svc/Dockerfile -t $(REPO)audit_svc
	docker build . -f entry_svc/Dockerfile -t $(REPO)entry_svc
	docker push $(REPO)invoices_svc
	docker push $(REPO)expected_date_svc
	docker push $(REPO)auth_svc
	docker push $(REPO)audit_svc
	docker push $(REPO)entry_svc