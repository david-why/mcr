# MCR Backend

This is the backend for the MCR project. It is an Azure Functions app written in Python that stores and retrieves shared ranking parameters from an Azure Cosmos DB.

## Development

The Visual Studio Code extension for Azure Functions is recommended for development. It provides a local development environment that can be used to test the backend code before deploying it to Azure.

1. Install the Azure Functions extension for Visual Studio Code.
2. Create a new Azure Cosmos DB account.
3. Create a new Azure Cosmos DB database and container.
4. Create a `local.settings.json` file with the following content:

    ```json
    {
        "IsEncrypted": false,
        "Values": {
            "FUNCTIONS_WORKER_RUNTIME": "python",
            "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
            "COSMOS_CONNECTION": "YOUR_CONNECTION_STRING",
            "COSMOS_DATABASE": "YOUR_DATABASE_NAME",
            "COSMOS_CONTAINER": "YOUR_CONTAINER_NAME"
        }
    }
    ```

5. Run the Azure Functions app locally by pressing `F5` in Visual Studio Code.
6. The server should now be running locally. Use the following endpoints to interact with the backend:
   - `GET http://localhost:7071/api/shares`: List the currently shared ranking parameters, sorted by creation date descending.
   - `POST http://localhost:7071/api/shares`: Create new shared ranking parameters.

## Deployment

1. Create a new Azure Functions app in the Azure portal.
2. Create a new Azure Cosmos DB account.
3. Create a new Azure Cosmos DB database and container.
4. Add the following environment variables to your Azure Functions app:
   - `COSMOS_CONNECTION`: The connection string for your Azure Cosmos DB account.
   - `COSMOS_DATABASE`: The name of your Azure Cosmos DB database.
   - `COSMOS_CONTAINER`: The name of your Azure Cosmos DB container.
5. Deploy the code in this repository to your Azure Functions app. The easiest way to do this is to use the Azure Functions extension for Visual Studio Code.
6. Use the following endpoints to interact with the backend:
   - `GET /api/shares`: List the currently shared ranking parameters, sorted by creation date descending.
   - `POST /api/shares`: Create new shared ranking parameters.
