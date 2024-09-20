package com.vtpl.forensic.utils;

import java.io.Reader;
import java.lang.reflect.Type;
import java.util.ArrayList;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.internal.bind.JsonTreeWriter;
import com.google.gson.reflect.TypeToken;

public class VGsonUtils {

	private static final Gson GSON = new Gson();
	
	public static final String BASE64_PREFIX = "data:image/jpeg;base64,";
	public static final String BASE64_PREFIX_1 = "data:";
	public static final String BASE64_PREFIX_2 = ";base64,";
	public static final String IMAGE_JPEG_VALUE = "image/jpeg";
	
	public static final String NO_IMAGE_AVAILABLE_BASE64 = "data:image/jpeg;base64,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";
	
	private static final Gson HTML_ESCAPE_DISABLED_GSON = new GsonBuilder().disableHtmlEscaping().create();
	
	public static String getJson(Object source) {
		return GSON.toJson(source);
	}
	
	public static String getJsonHtmlEscaped(Object source) {
		return HTML_ESCAPE_DISABLED_GSON.toJson(source);
	}
	
	public static <T> T getObject(String json, Class<T> classOfT) {
		return HTML_ESCAPE_DISABLED_GSON.fromJson(json, classOfT);
	}

	public static <T> T fromJson(JsonElement jsonElement, Class<T> classOfT) {
		return GSON.fromJson(jsonElement, classOfT);
	}
	
	public static <T> T getObject(Reader reader, Class<T> classOfT) {
		return GSON.fromJson(reader, classOfT);
	}
	
	public static <T> T fromJson(JsonArray jsonArray, Class<T> classOfT) {
		return GSON.fromJson(jsonArray, new TypeToken<ArrayList<T>>(){}.getType());
	}

	public static JsonElement toJsonTree(Object src, Type typeOfSrc) {
		JsonTreeWriter writer = new JsonTreeWriter();
		GSON.toJson(src, typeOfSrc, writer);
		return writer.get();
	}
	
	
	
	
}
