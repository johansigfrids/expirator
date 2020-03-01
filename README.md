# Certificate expiration

This is a simple Firefox extension that checks the number of days left until the certificate for the current page expires and displays it to the user.

It then shows the day count on top of a padlock icon in the toolbar. If there are less than 29 days left of the certificate the icon turns red. If the site connection is not encrypted it shows an unlocked red padlock instead.

The extensions uses a blocking `webRequest` callback because that is the only way to access the certificate for a request. In order to minimize the performance impact the extension caches the results for domains while Firefox is running. Entries in the cache are also expired if they are older than 1 day.

When Firefox restores a session the padlock will be grey to indicate that the extension does not know the state of the certificate because an actual connection to the server has not yet been made.