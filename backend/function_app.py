import functools
import json
import os
import uuid

import azure.functions as func
from azure.cosmos.aio import CosmosClient
from azure.cosmos.exceptions import CosmosResourceNotFoundError

COSMOS_CONNECTION = os.environ['COSMOS_CONNECTION']
COSMOS_DATABASE = os.environ['COSMOS_DATABASE']
COSMOS_CONTAINER = os.environ['COSMOS_CONTAINER']

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

cosmos = CosmosClient.from_connection_string(COSMOS_CONNECTION)
database = cosmos.get_database_client(COSMOS_DATABASE)
container = database.get_container_client(COSMOS_CONTAINER)

json_dumps = functools.partial(json.dumps, separators=(',', ':'))


def filter_data(data):
    return {k: v for k, v in data.items() if not k.startswith('_') or k == '_ts'}


class ErrorResponse(Exception):
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code


def jsonify(fun):
    @functools.wraps(fun)
    async def wrapper(*args, **kwargs):
        try:
            result = await fun(*args, **kwargs)
        except ErrorResponse as e:
            return func.HttpResponse(
                json_dumps({'success': False, 'error': e.message}),
                status_code=e.status_code,
                mimetype='application/json',
            )
        except:
            return func.HttpResponse(
                '{"success":false,"error":"Internal server error"}',
                status_code=500,
                mimetype='application/json',
            )
        if result is None or isinstance(result, (dict, list)):
            result = {'success': True, 'data': result}
            return func.HttpResponse(json_dumps(result), mimetype='application/json')
        return func.HttpResponse(result, mimetype='application/json')

    return wrapper


@app.route('shares', methods=['GET', 'POST'])
@jsonify
async def shares_route(req: func.HttpRequest):
    if req.method == 'GET':
        limit = int(req.params.get('limit', 10))
        limit = min(limit, 20)
        shares = container.query_items(
            query='SELECT * FROM c ORDER BY c._ts DESC', max_item_count=limit
        )
        result = []
        async for share in shares:
            result.append(filter_data(share))
        return result
    elif req.method == 'POST':
        data = req.get_json()
        share = {
            'id': str(uuid.uuid4()),
            'name': data['name'],
            'params': data['params'],
            'upvotes': 0,
        }
        created = await container.create_item(share)
        return filter_data(created)


@app.route('shares/{id}', methods=['DELETE'])
@jsonify
async def share_route(req: func.HttpRequest):
    if req.method == 'DELETE':
        id = req.route_params['id']
        try:
            await container.delete_item(id, id)
        except CosmosResourceNotFoundError:
            raise ErrorResponse('Share not found', 400)
