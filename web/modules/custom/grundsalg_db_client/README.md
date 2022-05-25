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

## API endpoint

```
POST /api/udstykning/{sid}/updated`

authorization: Token hat-og-briller
content-type: application/json

{
  "count": 3,
  "grunde": [
    {
      "id": 2919,
      "address": "Araliavej 27",
      "status": "Solgt",
      "area_m2": 816,
      "minimum_price": 800000,
      "sale_price": 800000,
      "pdf_link": null
    },
    {
      "id": 2913,
      "address": "Araliavej 39",
      "status": "Solgt",
      "area_m2": 825,
      "minimum_price": 800000,
      "sale_price": 801000,
      "pdf_link": null
    },
    {
      "id": 2917,
      "address": "Araliavej 41",
      "status": "Solgt",
      "area_m2": 825,
      "minimum_price": 800000,
      "sale_price": 800000,
      "pdf_link": null
    }
  ]
}
```

Go to `/admin/site-setup/db-client` to set the API token.
