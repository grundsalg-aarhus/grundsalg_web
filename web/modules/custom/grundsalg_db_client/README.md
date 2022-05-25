# Remember to provide variables for connection
In local settings.php file add

@TODO: Not sure that this will work as we now store it in a key/value store and not in exported config. If it don't work please use the form at _/admin/site-setup/db-client_ and remove this information from the readme.

```php
/**
 *  Fag system connection
 */
 $config['itkore_admin.itkore_config']['grundsalg_db_client_url'] = 'http://grundsalg.vm/api';
 $config['itkore_admin.itkore_config']['grundsalg_db_client_use_example_data'] = 1;
```

## API endpoints

Go to `/admin/site-setup/db-client` to set the API token used for `POST`'ing to the API.

### Udstykning

Update data on "udstykning":

```
POST /api/udstykning/{sid}/updated`

authorization: Token hat-og-briller
content-type: application/json

{
  "id": 301,
  "type": "Parcelhusgrund",
  "title": "Araliavej",
  "vej": "Araliavej",
  "city": "Harlev J",
  "postalCode": 8462,
  "geometry": {
    "type": "Point",
    "coordinates": [
      561650.23040898,
      6222961.1851024
    ]
  },
  "srid": null,
  "publish": true
}
```

### Grund

```
POST /api/udstykning/{sid}/grunde

authorization: Token hat-og-briller
content-type: application/json

{ … }
```

Get previously posted data:

```
GET /api/udstykning/{sid}/grunde
```

### Grund (GEOJson)

```
POST /api/udstykning/{sid}/grunde/geojson

authorization: Token hat-og-briller
content-type: application/json

{ … }
```

Get previously posted data:

```
GET /api/udstykning/{sid}/grunde/geojson
```
