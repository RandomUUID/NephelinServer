package de.nephelin.model;

import javax.faces.component.FacesComponent;
import javax.faces.component.UIComponentBase;
import java.util.logging.Logger;

/**
 * Created by sirmonkey on 4/29/15.
 */

@FacesComponent("de.nephelin.model.SessionFrame")
public class SessionFrame extends UIComponentBase{
    private static final Logger LOGGER = Logger.getLogger(SessionFrame.class.getName());
    public static final String COMPONENT_TYPE = "de.nephelin.model.SessionFrame";
    @Override
    public String getFamily() {
        return COMPONENT_TYPE;
    }

}
