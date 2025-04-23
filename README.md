# Kashiwa Imageboard engine

Kashiwa is a work-in-progress imageboard implementation using Nest.js

In this application, there is currently limited functionality,
but we have just begun development, and you have every opportunity to
follow it through to the final release :).

### Run the application with Docker

After saving the source code, do the following:
1. Make `volumes` directory in your `kashiwa` project root:
    ```sh
   $ cd kashiwa
   $ mkdir -p ./volumes
   ```
2. Make `.env` file in your `kashiwa` project root:
    ```sh
    $ touch .env
   ```
3. Fill the `.env` file with the following values:
    ```
    POSTGRES_HOST='db.kashiwa'
    POSTGRES_PORT=5432
    POSTGRES_USER='postgres'
    POSTGRES_PASSWORD='postgres'
    POSTGRES_DB='kashiwa'
    PGDATA='/var/lib/postgresql/data/pgdata'

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=kashiwa"

    NODE_ENV='production' 
    ```
4. Edit configurations in the file `configuration.yml` as you wish,
   but we strongly recommend you to change default values by paths `secure.user.salt-rounds` and `secure.session.secret`.
5. Next run the following commands:
    ```sh
    $ docker-compose build

    $ docker-compose up
    ```
Then go to [localhost](http://localhost).
And now you're awesome! Enjoy using the application!

Now you can go to [localhost/kashiwa/auth/sign-up](http://localhost/kashiwa/auth/sign-up) and create your first admin profile.

## License
<a href="https://github.com/d-indifference/kashiwa/blob/master/LICENSE">GPLV2 License</a>

Because we believe that open source is important.
