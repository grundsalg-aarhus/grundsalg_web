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