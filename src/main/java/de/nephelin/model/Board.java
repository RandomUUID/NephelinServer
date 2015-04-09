package de.nephelin.model;

import javax.faces.component.FacesComponent;
import javax.faces.component.UIComponentBase;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Board {

	private static final Logger LOGGER = Logger.getLogger(Board.class.getName());

	private Tile[][] tiles;

	private boolean initDone;

	private List<Tile> selectedTiles;

	public Board() {
		selectedTiles = new ArrayList<Tile>();
	}

}