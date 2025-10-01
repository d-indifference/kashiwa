# Kashiwa Imageboard engine

Kashiwa is a work-in-progress imageboard implementation using Nest.js

In this application, there is currently limited functionality,
but we have just begun development, and you have every opportunity to
follow it through to the final release :).

## Key Features

- Easy to install: simply clone the project, add an `.env` file ([see description below](#run-the-application-with-docker)), and start working with the application
- Configuration options: basic setup is done via a configuration file, but during operation you can customize page content and board functionality
- Extensive capabilities for creating and customizing boards
- Traditional imageboard features such as sage, tripcodes, text formatting (still a work in progress), captcha, anti-flood, thread hiding, and style switching
- Oekaki board support is available (for browsers that support ECMAScript6+)
- Support for uploading the most popular image, video, and audio formats, as well as the ability to upload torrents (yo-ho-ho! 🏴‍☠️) and .swf files
- Ability to add an administrative team: registered users can be either administrators or regular moderators
- Configure a spam filter using JavaScript regular expressions
- Ability to temporarily ban users who break the board’s rules, as well as set up an IP blacklist to block access entirely
- The engine supports database dumps and cached board backups — your data will be safe
- Initial REST API support for retrieving post information (detailed Swagger documentation available)
- Adding banners. Simply upload your banner images to `./kashiwa/static/img/banners`
- All localizable strings are stored in one place, making it easy to add new site translations

## Installation and Launch

### Run the application with Docker

After saving the source code, do the following:
1. Make `.env` file in your `kashiwa` project root:
    ```sh
    $ cd kashiwa
    $ touch .env
   ```
2. Fill the `.env` file with the following values:
    ```dotenv
    POSTGRES_HOST='db.kashiwa'
    POSTGRES_PORT=5432
    POSTGRES_USER='postgres'
    POSTGRES_PASSWORD='postgres'
    POSTGRES_DB='kashiwa'
    PGDATA='/var/lib/postgresql/data/pgdata'

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=kashiwa"

    KASHIWA_PHYSICS_VOLUME_POSTGRES='/var/lib/postgresql/data' # or you can change it to any other physical location you wish
    KASHIWA_PHYSICS_VOLUME_APPLICATION='/var/lib/application/data' # or you can change it to any other physical location you wish
    KASHIWA_CONFIGURATION_FILE='configuration.yml'

    NODE_ENV='production'
    ```
3. Edit configurations in the file `configuration.yml` as you wish,
   but we strongly recommend you to change default values by paths `secure.user.salt-rounds` and `secure.session.secret`.
4. Next run the following commands:
    ```sh
    $ docker compose build

    $ docker compose up
    ```
Then go to [localhost](http://localhost).
And now you're awesome! Enjoy using the application!

Now you can go to [localhost/kashiwa/auth/sign-up](http://localhost/kashiwa/auth/sign-up) and create your first admin profile.

### Run the application without Docker

If you want to run **Kashiwa Imageboard Engine** without Docker, you need to make sure the following dependencies are installed on your system:
* **Node.js** (version 23.11.0 or higher)
* **Nginx** (optional, but recommended to configure as a reverse proxy. [Example configuration for HTTP](https://github.com/d-indifference/kashiwa/blob/main/nginx/nginx.conf))
* **PostgreSQL** (version 13.3 or higher)

Additionally, we recommend checking if the `pg_dump` utility is available on your system:
```sh
$ pg_dump --version
```
If it is missing, install it with the following command:
```sh
$ sudo apt-get update && sudo apt-get install postgresql-client
```

We also recommend making sure that `@nestjs/cli` is installed globally. If not, install it as follows:
```sh
$ npm i -g @nestjs/cli
```

So, after completing the steps above, let’s proceed with installing the imageboard engine:

1. Clone the repository and install the dependencies:
   ```sh
   $ cd kashiwa
   $ npm i
   ```
   Optionally, to make sure the application works, you can run the tests:
   ```sh
   $ npm run test
   ```
2. Install the following utilities on your system (if not already installed):
    * `imagemagick`
    * `ffmpeg`
    * `zip`
   ```sh
   $ sudo apt-get update && sudo apt-get install -y imagemagick ffmpeg zip
   ```
3. In PostgreSQL, create a database and a schema:
   ```postgresql
   CREATE DATABASE kashiwa WITH OWNER postgres;
   ```
   ```postgresql
   CREATE SCHEMA IF NOT EXISTS kashiwa;
   ```
4. Create a `.env` file with the parameters below:
   ```dotenv
    # your postgres instance host
    POSTGRES_HOST='localhost'
    # your postgres instance port
    POSTGRES_PORT=5432
    # your postgres username
    POSTGRES_USER='postgres'
    # your postgres password
    POSTGRES_PASSWORD='postgres'
    # database name
    POSTGRES_DB='kashiwa'

    # database connection URL (needed for Prisma)
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=kashiwa"

    KASHIWA_CONFIGURATION_FILE='configuration.yml' # or you can leave it empty, because configuration.yml is the default name of configuration file

    NODE_ENV='production'
   ```
5. Edit the `configuration.yml` file as you wish. However, for security reasons we strongly recommend changing the values of `secure.user.salt-rounds` and `secure.session.secret`.
6. Run the database migration. Prisma will generate the client automatically:
   ```sh
   $ npm run migrate:dev
   ```
7. Build the application:
   ```sh
   $ npm run build
   ```

8. Congratulations, you’re ready to run the engine! Start it with:
   ```sh
   $ npm run start:prod
   ```
   Then go to [localhost:3000](http://localhost:3000).
   Now you can go to [localhost:3000/kashiwa/auth/sign-up](http://localhost:3000/kashiwa/auth/sign-up) and create your first admin profile.
9. (Optionally) Now you can set up a reverse proxy for the website, instructions will not be given here.

## Supported markdown

The engine supports the following types of text markdown in user's message:

| Tag / Syntax                   | HTML Output                              | Description                              | Available when you disable the "Allow Markdown" option in the board settings. |
|--------------------------------|------------------------------------------|------------------------------------------|-------------------------------------------------------------------------------|
| `>text` (at beginning of line) | `<span class="unkfunc">&gt;text</span>`  | Quote                                    | ✔️                                                                            |
| `[spoiler]text[/spoiler]`      | `<span class="spoiler">text</span>`      | Spoiler                                  | ❌                                                                             |
| `[code]text[/code]`            | `<pre><code>text</code></pre>`           | Code block                               | ❌                                                                             |
| `[s]text[/s]`                  | `<s>text</s>`                            | Strikethrough                            | ❌                                                                             |
| `[b]text[/b]`                  | `<b>text</b>`                            | Bold text                                | ❌                                                                             |
| `[i]text[/i]`                  | `<i>text</i>`                            | Italic text                              | ❌                                                                             |
| `>>123`                        | `<a href="/board/res/123.html#123" ...>` | Reply link to another comment            | ✔️                                                                            |
| URL (http/https/ftp/irc)       | `<a href="url" rel="noreferrer">url</a>` | Converts plain URLs into clickable links | ✔️                                                                            |

Administrators cannot write using markup under their account, however, they have full and unrestricted support for HTML markup (**please use this at your own risk**).

## Website Configuration params

The following is a list of application configuration parameters from the `configuration.yml` file.

| Parameter name            | Type      | Description                                                                                 | Remarks                                     |
|---------------------------|-----------|---------------------------------------------------------------------------------------------|---------------------------------------------|
| `application.name`        | `string`  | The name of the application that will be displayed in the Swagger                           |                                             |
| `application.description` | `string`  | The description of the application that will be displayed in the Swagger                    |                                             |
| `http.port`               | `number`  | Node.js HTTP server port on which the application will run                                  |                                             |
| `file-storage.path`       | `string`  | The absolute path to the application where generated pages and downloaded files are stored. |                                             |
| `secure.user.salt-rounds` | `number`  | Number of password encryption iterations                                                    | It is recommended to increase in production |
| `secure.session.secret`   | `string`  | A secret for session encryption                                                             | It is recommended to change in production   |
| `captcha.salt-rounds`     | `number`  | Number of captcha answer encryption iterations                                              |                                             |
| `captcha.size`            | `number`  | The length of the random captcha string                                                     |                                             |
| `captcha.ignoreChars`     | `string`  | Filter out some characters from the captcha                                                 |                                             |
| `captcha.noise`           | `number`  | Number of noise lines on captcha image                                                      |                                             |
| `captcha.color`           | `boolean` | If false, captcha will be black and white otherwise, it will be randomly colorized          |                                             |
| `captcha.background`      | `string`  | Background color of svg captcha image                                                       |                                             |

## Supported file formats

Currently, the imageboard supports the following file types for uploading via the message sending interface:

- `image/png`
- `image/jpeg`
- `image/gif`
- `image/svg+xml`
- `image/webp`
- `video/mp4`
- `video/webm`
- `audio/aac`
- `audio/x-m4a`
- `audio/mpeg`
- `audio/ogg`
- `audio/flac`
- `application/x-bittorrent`
- `application/x-shockwave-flash`
- `application/x-7z-compressed`

In the settings for a specific board, you can set more specific file formats available for upload, limit the size of the uploaded file, or disable any file uploads altogether.

## Localization

### How I can translate the site to my language?

You now have an easier way to create your own localization for the Kashiwa engine.

An example file with all the localizable strings can be found at: `kashiwa/src/locale/locale-en.ts`

You can create another file with your own strings in your language based on the file `locale-en.ts` and connect it by importing it in the file `kashiwa/src/locale/locale.ts`

Alternatively, you can simply rewrite the existing strings in the `locale-en.ts` file in the language you want to translate the site into.

If desired, you can submit pull requests with your completed localizations.

## License
<a href="https://github.com/d-indifference/kashiwa/blob/master/LICENSE">GPLV2 License</a>

Because we believe that open source is important.
