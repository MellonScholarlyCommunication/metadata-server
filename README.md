# Metadata Server

An experimental metadata Service Provider using the [Event Notification](https://www.eventnotifications.net) protocol.

This services requires accesss to a [Zotero translator](https://github.com/zotero/translation-server) service.

## Install

```
yarn install
```

## Configuration

```
cp .env-example .env
```

## Run the server

```
yarn run server
```

## Add a demo notification to the inbox 

Post an example that should result in successful lookup

```
yarn run post-data 
```

Post an example that should result in a failed lookup. In this example we are posting the none-existent URL https://lib.ugent.be/123. When `ZOTERO_FALLBACK` is set to `true` an attempt will be made to retrieve this URL via the Internet Archive (which should also fail).

```
yarn run post-fail
```

Post an example that should result in a failed lookup when `ZOTERO_FALLBACK` is set to `false`. 

```
yarn run post-fallback
```

### Example notification

```
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "urn:uuid:9ec17fd7-f0f1-4d97-b421-29bfad935aad",
  "type": "Offer",
  "published": "2024-08-01T07:00:11.000Z",
  "actor": {
    "id": "http://mycontributions.info/service/m/profile/card#me",
    "name": "Mastodon Bot",
    "inbox": "http://mycontributions.info/service/m/inbox/",
    "type": "Service"
  },
  "object": {
    "id": "https://journal.code4lib.org/articles/17823",
    "type": "Document"
  }
}
```

where `$.object.id` is the URL for which a JSON CSL result should be created.

## Process the inbox

```
yarn run handle-inbox
```

### Example outgoing notification

```
{
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Announce",
    "actor": {
        "id": "http://localhost:8000/profile/card#me",
        "name": "Mastodon Bot",
        "inbox": "http://localhost:8000/inbox/",
        "type": "Service"
    },
    "object": {
        "id": "http://localhost:8000/result/2024/08/12/3b0bace90cea16941d61d696fe4f2a87.json",
        "type": "Document"
    },
    "target": {
        "id": "http://mycontributions.info/service/m/profile/card#me",
        "name": "Mastodon Bot",
        "inbox": "http://mycontributions.info/service/m/inbox/",
        "type": "Service"
    }
}
```

### Example service result

```
[
  {
    "key": "2CL8KBEJ",
    "version": 0,
    "itemType": "journalArticle",
    "creators": [
      {
        "firstName": "Patrick",
        "lastName": "Hochstenbach",
        "creatorType": "author"
      },
      {
        "firstName": "Ruben",
        "lastName": "Verborgh",
        "creatorType": "author"
      },
      {
        "firstName": "Herbert Van de",
        "lastName": "Sompel",
        "creatorType": "author"
      }
    ],
    "tags": [],
    "publicationTitle": "The Code4Lib Journal",
    "ISSN": "1940-5758",
    "url": "https://journal.code4lib.org/articles/17823",
    "title": "Using Event Notifications, Solid and Orchestration for Decentralizing and Decoupling Scholarly Communication",
    "abstractNote": "The paper presents the case for a decentralized and decoupled architecture for scholarly communication. An introduction to the Event Notifications protocol will be provided as being applied in projects such as the international COAR Notify Initiative and the NDE-Usable program by memory institutions in The Netherlands. This paper provides an implementation of Event Notifications using a Solid server. The processing of notifications can be automated using an orchestration service called Koreografeye. Koreografeye will be applied to a citation extraction and relay experiment to show all these tools fit together.",
    "issue": "58",
    "date": "2023-12-04",
    "libraryCatalog": "Code4Lib Journal",
    "accessDate": "2024-08-12T08:43:33Z"
  }
]
```

## Process the outbox

```
yarn run handle-outbox
```

## Clean all processed results

```
yarn real-clean
```

## Configuration parameters

- `LOG4JS` : logging level
- `LDN_SERVER_OTHER_CONFIG` : configuration file defining the inbox/outbox endpoints
- `LDN_SERVER_INBOX_PATH` : local path to the inbox
- `LDN_SERVER_OUTBOX_PATH` : local path to the outbox
- `LDN_SERVER_PUBLIC_PATH` : local path to the public directory (serving documents)
- `LDN_SERVER_INBOX_CONFIG` : configuration file defining the inbox handlers
- `LDN_SERVER_OUTBOX_CONFIG` : configuration file defining the oubox handlers
- `LDN_SERVER_BASEURL` : base URL of this metadata server
- `ZOTERO_SERVICE` : Location of a Zotero translator service
- `ZOTERO_FORMAT` : Requested format to return from the Zotero service
- `ZOTERO_CONTENT_TYPE` : Requested content type for `ZOTERO_FORMAT`
- `ZOTERO_FALLBACK` : Attempt to fallback to an Internet Archive lookup when an URL lookup fails

The metadata server needs to be restarted when configuration parameters are updated.

## Docker

We provide a Dockerized version of this software, that can be run with Docker Compose.

### Submit a Notification

```
curl -X POST -H 'Content-Type: application/ld+json' --data-binary '@data/example.jsonld' http://localhost:3001/inbox/
```

## Docker 

Build a version of a docker image:

```
docker build . -t hochstenbach/metadata-server:v0.0.2
```

Run a docker image:

```
docker container run -p 3001:3001 --rm hochstenbach/metadata-server:v0.0.2
```

Push it to DockerHub:

```
docker push hochstenbach/metadata-server:v0.0.2
```