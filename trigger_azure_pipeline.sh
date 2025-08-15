#Need ECR
az pipelines run --name "[__app-code__] communication-api__ci"
az pipelines run --name "[__app-code__] graph-gateway__ci"
az pipelines run --name "[__app-code__] master-data-api__ci"
az pipelines run --name "[__app-code__] user-management-api__ci"
az pipelines run --name "[__app-code__] web-apigw__ci"
az pipelines run --name "[__app-code__] webnext__ci"
#Need DynamoDB Name & S3 bucket
az pipelines run --name "[__infra-code__] backend-cicd"


app_code_ci=("[__app-code__] communication-api__ci" "[__app-code__] graph-gateway__ci" "[__app-code__] master-data-api__ci" "[__app-code__] user-management-api__ci" "[__app-code__] web-apigw__ci" "[__app-code__] webnext__ci")

# Loop through each CI pipeline and trigger CD after success
for ci_pipeline in "${some_ci[@]}"; do
    trigger_cd_pipeline_after_ci "$ci_pipeline"
done

trigger_cd_pipeline_after_ci() {
    CI_PIPELINE_NAME=$1
    CD_PIPELINE_NAME="${CI_PIPELINE_NAME%_ci}_cd"

    echo "Triggering CI pipeline: $CI_PIPELINE_NAME"

    CI_RUN_ID=$(az pipelines run --name "$CI_PIPELINE_NAME" --query 'id' -o tsv)

    if [ -z "$CI_RUN_ID" ]; then
        echo "Failed to trigger CI pipeline: $CI_PIPELINE_NAME"
        return 1
    fi

    echo "CI pipeline triggered successfully. Run ID: $CI_RUN_ID"

    while true; do
        STATUS=$(az pipelines runs show --id "$CI_RUN_ID" --query 'status' -o tsv)

        if [[ "$STATUS" == "completed" ]]; then
            RESULT=$(az pipelines runs show --id "$CI_RUN_ID" --query 'result' -o tsv)
            if [[ "$RESULT" == "succeeded" ]]; then
                echo "CI pipeline $CI_PIPELINE_NAME completed successfully. Triggering CD pipeline: $CD_PIPELINE_NAME"
                az pipelines run --name "$CD_PIPELINE_NAME"
                break
            else
                echo "CI pipeline $CI_PIPELINE_NAME failed. Not triggering CD pipeline."
                return 1
            fi
        else
            echo "CI pipeline $CI_PIPELINE_NAME still running... Checking again in 30 seconds."
            sleep 30
        fi
    done
}