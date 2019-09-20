package com.peploleum.insight.domain.dictionary;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "clef",
    "pond"
})
public class Motclef implements Serializable {

    @JsonProperty("clef")
    private String clef;
    @JsonProperty("pond")
    private String pond;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("clef")
    public String getClef() {
        return clef;
    }

    @JsonProperty("clef")
    public void setClef(String clef) {
        this.clef = clef;
    }

    @JsonProperty("pond")
    public String getPond() {
        return pond;
    }

    @JsonProperty("pond")
    public void setPond(String pond) {
        this.pond = pond;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
