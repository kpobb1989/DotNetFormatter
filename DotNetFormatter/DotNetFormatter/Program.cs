using DotNetFormatter.Swagger;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.DocumentFilter<RemoveRootPathFilter>();
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Default redirect to the swagger page
app.MapGet("/", [ApiExplorerSettings(IgnoreApi = true)] () => Results.Redirect("/swagger"));

app.UseHttpsRedirection();

app.UseCors(); 

app.UseAuthorization();

app.MapControllers();

app.Run();