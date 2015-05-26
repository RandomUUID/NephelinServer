package de.nephelin.controller;

import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.Session;
import java.util.HashMap;
import java.util.UUID;
import java.util.logging.Logger;
import de.nephelin.model.Game;

/**
 * Created by sirmonkey on 4/2/15.
 */
public class GameController {

    private static final Logger LOGGER = Logger.getLogger(GameController.class.getName());

    private static GameController instance = new GameController();
    private HashMap<UUID,Game> games ;
    private GameController() {
        games = new HashMap<>();
    }

    private void newGame(Session session) {
        LOGGER.info("New Game for: "+session.getId());
        UUID id = UUID.randomUUID();
        games.put(id, new Game(id));
        JsonObject payload = Json.createObjectBuilder().add("game_id",id.toString()).build();
        JsonObject msg = Json.createObjectBuilder()
                .add("command", "relay")
                .add("receiver", "mainpanel")
                .add("action", "joinGame")
                .add("payload", payload)
        .build();
        SessionController.getInstance().sendMessage(session, msg);

        //TODO Hacky!
        JsonObject msg2 = Json.createObjectBuilder()
                .add("command", "relay")
                .add("receiver", "menu")
                .add("action", "init")
                .build();
        SessionController.getInstance().sendMessage(session, msg2);
    }

    private void joinGame(Session session, JsonObject msg) {
        JsonObject payload = msg.getJsonObject("payload");
        LOGGER.info("Joining Game: " + payload.getString("game_id"));
        JsonObject response = Json.createObjectBuilder()
                .add("command", "log")
                .add("receiver", "board")
                .add("action", "init")
                .add("payload",payload)
                .build();
        SessionController.getInstance().sendMessage(session, response);
    }

    public void receive(Session session, JsonObject msg) {
        switch (msg.getString("action")) {
            case "newGame":
                newGame(session);
                break;
            case "joinGame":
                joinGame(session, msg);
                break;
            case "fubar":
                LOGGER.info("FUBAR activatet!");
        }

    }

    public static GameController  getInstance() {
        return instance;
    }
}