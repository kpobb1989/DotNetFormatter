using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Formatting;
using Microsoft.CodeAnalysis.Text;

namespace DotNetFormatter.Controllers;

[ApiController]
[Route("[controller]")]
public class FormatCodeController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Index([FromBody] string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return BadRequest("Code cannot be empty.");

        try
        {
            using var workspace = new AdhocWorkspace();

            var projectId = ProjectId.CreateNewId();
            var solution = workspace.CurrentSolution.AddProject(ProjectInfo.Create(
                projectId,
                VersionStamp.Create(),
                "TempProject",
                "TempProject",
                LanguageNames.CSharp));

            var documentId = DocumentId.CreateNewId(projectId);

            solution = solution.AddDocument(documentId, "FormatMe.cs", SourceText.From(code));

            var document = solution.GetDocument(documentId);

            if (document == null) return StatusCode(500, "An error occurred during formatting. Document is null.");

            var formattedDocument = await Formatter.FormatAsync(document);

            var formattedText = await formattedDocument.GetTextAsync();

            return Ok(formattedText.ToString());
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);

            return StatusCode(500, "An error occurred during formatting. Please check the C# syntax.");
        }
    }
}