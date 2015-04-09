package de.nephelin.model;

import javax.websocket.Session;
import java.util.List;
import java.util.UUID;

/**
 * Created by sirmonkey on 4/2/15.
 */
public class Game {
    private UUID id;
    private Board board;
    private List<Session> players;

    public void join(Session session) {
        players.add(session);
    }

    public void leave(Session session) {
        players.remove(session);
    }

    public Game(UUID id) {
        this.id = id;
    }
}
