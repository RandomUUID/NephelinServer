package de.nephelin.controller;

import sun.rmi.runtime.Log;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonValue;
import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * Created by sirmonkey on 4/2/15.
 */
public class SessionController {

    private static final Logger LOGGER = Logger.getLogger(SessionController.class.getName());

    private static SessionController instance = new SessionController();

    private List<Session> waitingRoom;

    private SessionController() {
        waitingRoom = new ArrayList<Session>();
       // map = new HashMap<Board, Session>();
    }

    public void joinWaitingRoom(Session session) {
        LOGGER.info(session.getId() + " joined the waiting room.");
        JsonObject msg = Json.createObjectBuilder()
                .add("command", "wait").build();
        sendMessage(session, msg);
        waitingRoom.add(session);
    }
    public void leaveWaitingRoom(Session session) {
        LOGGER.info(session.getId() + " left the waiting room.");
        waitingRoom.remove(session);
    }

    public void sendMessage(Session session, JsonObject msg) {
        if (session.isOpen()) {
            try {

                session.getBasicRemote().sendText(msg.toString());
                LOGGER.info("Send: " + msg.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void receiveMessage(Session session, JsonObject msg) {
        LOGGER.info("Inc from: " + session.getId());
        if ( msg.containsKey("command") ) {
            LOGGER.info("BONKERS!");
        }
        String cmd = msg.getString("command");
        String ack = "false";


        if (cmd.equals("relay")) {
            switch (msg.getString("receiver")) {
                case "GameController":
                    GameController.getInstance().receive(session, msg);
                    break;
                default:
                    LOGGER.info("Receiver:"+ msg.getString("receiver") + " not found!");
                    break;
            }
        } else {
            LOGGER.info("WOOPS");
        }

        //Acknowledge Managment
        try{
            ack = msg.getString("ack");
        } catch (Exception e){
        }
        //Incoming Acknowledge
        if (cmd.equals("response")){
            LOGGER.info("ACK:   "+ msg.getString("payload") + " received");
        }
        //Outgoing Acknowledge
        if(ack.equals("true")){
            JsonObject retMsg = Json.createObjectBuilder()
                    .add("command", "response")
                    .add("receiver", msg.get("sender"))
                    .add("sender", msg.get("receiver"))
                    .add("payload", msg.getString("command"))
                    .add("ack", "false")

                    .build();
            sendMessage(session, retMsg);
        }
    }

    public static SessionController getInstance() {
        return instance;
    }
}
