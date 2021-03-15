# transaction-manager
Simple transaction manager for json messages

## Instalation

```
npm install --save transaction-manager
```

## Usage example

```
const TransactionManager = require("../index.js");

//Use websocket as transport
var tm = new TransactionManager(websocket);

//Add listeners for commands
tm
	.on("cmd",(cmd)=> {
		console.log("got cmd", cmd.name);
		switch(cmd.name) 
		{
			case "..." :
				cmd.accept(...);
				break;
			case "..." :
				cmd.reject(...);
				break;
		}
	})
	.on("event",(event)=> {
		console.log("got event", event.name);
	});

//Send new command
tm.cmd("cmd_name", cmd_data)
	.then((data) => {
		console.log("command accepted with data", data);
	})
	.reject((data) => {
		console.log("command accepted with data", data);
	});

tm.event("event_name");

```

### Namespacing

It is possible to provide a `namespace` attribute the command and events so you can route them easily between different listeners.

You can either provide a third parameter to the `cmd(name,data,namespace)` and `event(name,data,namespace)` or create a `Namespace` object that will handle internals for you on both sending and receiving:

```

var ns1 = tm1.namespace("ns");
var ns2 = tm2.namespace("ns");

ns2.on("cmd",(cmd)=> {
	console.log("ns2::got command", cmd.name);
	cmd.accept("accepted");
});


ns1.cmd("test_namespace", { dummy: 1})
	.then(() => {
		console.log("ns1::command accepted");
	})
	.catch(console.error);
	
```

Note that if a namespace has been created for a received message, the event will not be emited to the main `TransactionManager` object but only to the registered `Namespace`

## Wire protocol
The transaction manager uses a JSON based message format to exchange data between both ends (using WebSockets for example).

The base message will be a json object with a type property:

```
{
	"type" : "cmd"
}
```

There are three different message types allowed in this specification: cmd, response and event.

### Command message
The command message is a json object which type is “cmd”.It is used when the sending side expect a response from the other side as a result of this command.

Appart of the cmd attribute, it also contain the following attributes:

```
{
	"type"   : "cmd",
	"transId": 0,
	"name"   : "command_name",
	"data"   : ...
}
```

- type (String): “cmd”
- transId (Integer) : Unique id for this command transaction
- name (String): Command name
- data  (String | Date | Array | Object) : custom command data

### Response message
The command message is a json object which type is “response”. It is used to accept a command sent by the other peer and pass some custom data associated to the response.

Apart of the cmd attribute, it also contain the following attributes:

```
{
	"type"    : "response",
	"transId" : 0,
	"data"    : ...
}
```

- type (String): “response”
- transId (Integer) : value from the command this response belongs to
- data  (String | Date | Array | Object) : custom response data

### Error message
The command message is a json object which type is “error”. It is used to reject a command sent by the other peer and pass some custom data associated to the error.

Apart of the cmd attribute, it also contain the following attributes:

```
{
	"type"    : "error",
	"transId" : 0,
	"data"    : ...
}
```

- type (String): “error”
- transId (Integer) : value from the command this error belongs to
- data  (String | Date | Array | Object) : custom error data


For each command, there must be a single response or error message matching the transaction id of the command.

### Event message
Event messages are used when the sending side does not expect any kind of response back and has a type of “event”. It has the following attributes:

```
{
	"type": "event",
	"name": "event_name",
	"data": ... 
}
```

- type (String): “event”
- name (String): Event name
- data  (String | Date | Array | Object) : custom event data

Note that the event message does not have any transaction id as it is not meant to be acknowledged by the receiving side.

## License

MIT