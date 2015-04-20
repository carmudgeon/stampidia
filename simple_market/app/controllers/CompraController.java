package controllers;

import java.util.ArrayList;
import java.util.List;

import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;
import models.Compra;
import models.Usuario;
import play.db.jpa.JPA;
import play.libs.Json;

@Transactional(value="marketplace")
public class CompraController extends Controller{

	public static Result getCompras()
	{
		List<Compra> compras = JPA.em().createQuery("SELECT u FROM "
				+ "Compra u",Compra.class).getResultList();
		return ok(Json.toJson(compras));
	}

	public static Result getCompra(Long id)
	{
		Compra compra = JPA.em().find(Compra.class, id);
		return compra == null ? notFound() : ok(Json.toJson(compra));
	}

	public static Result createCompra()
	{
		Compra newcompra = Json.fromJson(request().body().asJson(),
				Compra.class);
		JPA.em().persist(newcompra);
		return created(Json.toJson(newcompra));
	}

	public static Result updateCompra(Long id)
	{
		Compra newcompra= Json.fromJson(request().body().asJson(),
				Compra.class);
		Compra updated = JPA.em().merge( newcompra);
		return ok(Json.toJson(updated));
	}

	public static Result deleteCompra(Long id)
	{
		Compra compra=JPA.em().find(Compra.class, id);
		if(compra==null)
		{
			return notFound();
		}
		else
		{
			JPA.em().remove(compra);
			return noContent();
		}
	}
	
	
	public static Result getComprasByUser(Long id)
	{
		Usuario user = JPA.em().find(Usuario.class, id);
		return user == null ? notFound() : ok(Json.toJson(user.getCompras()));
	}
	
	public static Result createComprasToUser(Long id)
	{
		Usuario user = JPA.em().find(Usuario.class, id);
		Compra newcompra = Json.fromJson(request().body().asJson(),
				Compra.class);
		user.getCompras().add(newcompra);
		JPA.em().persist(user);
		return created(Json.toJson(newcompra));
	}
	
	

}
