package de.nephelin.component;

/**
 * Created by sirmonkey & generation0 on 4/29/15.
 */


import javax.faces.application.ResourceDependencies;
import javax.faces.application.ResourceDependency;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import javax.faces.render.FacesRenderer;
import javax.faces.render.Renderer;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import de.nephelin.model.SessionFrame;

@ResourceDependencies({
        @ResourceDependency(library = "javax.faces", name = "jsf.js", target = "head"),
        @ResourceDependency(library = "javascript", name = "jquery.js", target = "head"),
        @ResourceDependency(library = "javascript", name = "bundle.js", target = "head")
}
)
@FacesRenderer(componentFamily = "de.nephelin.model.SessionFrame", rendererType = "de.nephelin.component.SessionFrameRenderer")
public class SessionFrameRenderer extends Renderer {
    private static final Logger LOGGER = Logger.getLogger(SessionFrameRenderer.class.getName());

    @Override
    public void decode(FacesContext ctx, UIComponent component) {
    }

    @Override
    public void encodeBegin(FacesContext context, UIComponent component) throws IOException {
        LOGGER.log(Level.INFO, "Encoding: " + component);
        // Path for the websocket connection
        String contextpath = ((HttpServletRequest) context.getExternalContext().getRequest()).getContextPath();

        SessionFrame sessionFrame = (SessionFrame) component;
        ResponseWriter writer = context.getResponseWriter();

        // HTML5 Fun
        writer.startElement("div", component);
        writer.writeAttribute("id", component.getId(), null);
        writer.startElement("p", component);
        writer.write("WOOOOP!");
        writer.endElement("p");
        writer.endElement("div");

        writer.startElement("div", component);
        writer.writeAttribute("id", "SidePanel", null);
        writer.startElement("canvas", component);
        writer.writeAttribute("id", "cv", null);
        writer.writeAttribute("width", "800", null);
        writer.writeAttribute("height", "700", null);
        writer.endElement("canvas");
        writer.endElement("div");

        // Script tag to initialize the JavaScript.
        writer.startElement("script", component);
        writer.write("console.log('Hello Darkness my old friend')");
        writer.endElement("script");
    }
}
