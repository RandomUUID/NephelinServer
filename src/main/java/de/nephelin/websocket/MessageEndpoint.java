package de.nephelin.websocket;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import de.nephelin.controller.SessionController;

/**
 * Created by sirmonkey on 4/2/15.
 */
@javax.websocket.server.ServerEndpoint(value = "/messagechannel")
public class MessageEndpoint {

    private static final Logger LOGGER = Logger.getLogger(MessageEndpoint.class.getName());

    /**
     * Adds on open the session to the controller list and sends to the client the session id.
     * @param session Session
     */
    @OnOpen
    public void onOpen(Session session) {
        LOGGER.info( "Opening Session: " + session.getId());
        SessionController.getInstance().joinWaitingRoom(session);
        JsonObject msg = Json.createObjectBuilder().add("command", "log")
                .add("payload", "heavy").build();
        SessionController.getInstance().sendMessage(session, msg);
    }

    /**
     * Parses the incoming Message to a JSON Object.
     * @param message Json as String.
     * @param session Session where the message came from.
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        JsonReader jsonReader = Json.createReader(new StringReader(message));
        JsonObject msg = jsonReader.readObject();
        jsonReader.close();
        LOGGER.info("Inc: " + msg.toString());
        SessionController.getInstance().receiveMessage(session, msg);

    }

    @OnClose
    public void onClose(Session session) {
        LOGGER.log(Level.INFO, "close connection: " + session.getId());
        SessionController.getInstance().leaveWaitingRoom(session);
    }
}
