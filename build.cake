#addin "Cake.Npm"
#addin "Cake.FileHelpers"
#addin "Cake.Json"
#addin "SharpZipLib"
#addin "Cake.Compression"
#load "scripts/utils.cake"

using System.Xml.Linq;
using System.Xml.XPath;

//---------------------------------------------------------------------------------------
// Global parameters
//=======================================================================================
var Target = Argument("target", "Test");
var Clean = HasArgument("clean");

var AppName = "ColorTemperature";

// Confiuration parameters.
var Configuration = Argument("configuration", "Debug");

var IsReleaseBuild = string.Compare(Configuration, "Release", false) == 0;
var SignApp = IsReleaseBuild;
var UpdateBuildNumber = IsReleaseBuild;
var PublishPackage = IsReleaseBuild;

// Source directories
var AppSrcDir = "./app";
var TsSrcDir = AppSrcDir + "/ts";
var PackgeSrcDir = "./pkg";

var ManifestFilename = AppSrcDir + "/CSXS/manifest.xml";

// Build directories
var BuildDir = "./build/" + Configuration;
var CompiledAppDir = BuildDir + "/app";
var PackageDir = BuildDir + "/pkg";
var SignedAppDir = PackageDir + "/html";

var SignedAppZxp = BuildDir + "/" + AppName + ".zxp";

//
var DistDir = "./dist";

// Build configuration which loaded from build config file.
class BuildConfigInfo
{
    public string ZxpSignCmd;
    public string CertFile;
    public string PassFile;
    public string PackageVersion;
}

var BuildConfigFile = "./build-config.json";
BuildConfigInfo BuildConfig;
 
//---------------------------------------------------------------------------------------
//  Setup
//=======================================================================================
var SassCompiler = "";
var TsCompiler  = "";

Setup(context => {

    if (Context.Tools.Resolve("npm-sass") == null)
    {
        Npm.WithLogLevel(NpmLogLevel.Silent).FromPath("./tools/").Install(settings => settings.Package("npm-sass"));
    }

    SassCompiler = Context.Tools.Resolve("npm-sass.cmd").FullPath;
    TsCompiler = Context.Tools.Resolve("tsc.exe").FullPath;

    BuildConfig = DeserializeJsonFromFile<BuildConfigInfo>(BuildConfigFile);

    // Update build number
    if (UpdateBuildNumber)
    {
        // Update build number value in build config file.
        var curVer  = new Version(BuildConfig.PackageVersion);
        var now = DateTime.UtcNow; 
        var build = (now.Year % 100) * 10000 + now.Month * 100 + now.Day; 
        var newVer = new Version(curVer.Major, curVer.Minor, build, curVer.Revision + 1);
        BuildConfig.PackageVersion = newVer.ToString();
        SerializeJsonToFile<BuildConfigInfo>(BuildConfigFile, BuildConfig);

        // Update build number value in manifest.xml
        var doc = XDocument.Load(NormalizePath(ManifestFilename));
        doc.XPathSelectElement("//ExtensionList/Extension").Attribute("Version").Value = newVer.ToString();
        doc.Save(NormalizePath(ManifestFilename));
    }

    Information("Packge Version: {0}", BuildConfig.PackageVersion);
});

//---------------------------------------------------------------------------------------
//=======================================================================================
Task("Clean")
    .WithCriteria(Clean)
    .Does(() => {
        CleanDirectories(BuildDir);
    });

//---------------------------------------------------------------------------------------
//  Compile App
//=======================================================================================
ItemCollection compiledAppItems;

Task("Compile")
    .IsDependentOn("CompileSCSS")
    .IsDependentOn("CompileTypeScript")
    .IsDependentOn("PlaceAppFiles")
    .Does(() => {
        compiledAppItems = CreateItemCollection(CompiledAppDir, "/**/*", SignedAppDir);
    });

// Compile typescript
var tsItems = CreateItemCollection(
    AppSrcDir + "/ts", "/**/*.ts",
    CompiledAppDir + "/js", ".js",
    (p) => !p.EndsWith(".d.ts"));

Task("CompileTypeScript")
    .WithCriteria(() => tsItems.IsStaled())
    .Does(() => {
        EnsureDirectoryExists(CompiledAppDir + "/js");
        RunProcess(TsCompiler,
            "--p", TsSrcDir + "/tsconfig-" + Configuration + ".json",
            "-outDir", CompiledAppDir + "/js");
    });

// Compile SCSS
var scssItems = CreateItemCollection(
    AppSrcDir + "/scss", "/**/*.scss",
    CompiledAppDir + "/css", ".css");

Task("CompileSCSS")
    .WithCriteria(() => scssItems.IsStaled())
    .Does(() => {
        foreach(var item in scssItems)
        {
            Information("{0} -> {1}", item.SourcePath, item.TargetPath);
            EnsureDirectoryExists(new FilePath(item.TargetPath).GetDirectory());
            FileWriteLines(item.TargetPath, RunProcess(SassCompiler, item.SourcePath));
        }
    });

// Place App items
var appItems = CreateItemCollection();
appItems.Include(AppSrcDir, "/**/*", CompiledAppDir, null, (p) => !(p.Contains("/ts/") || p.Contains("/scss/")));
appItems.Include(AppSrcDir + "/ts", "/**/*.js", CompiledAppDir + "/js");

Task("PlaceAppFiles")
    .WithCriteria(() => appItems.IsStaled())
    .Does(() => appItems.CopyFromSourceToTarget());

//---------------------------------------------------------------------------------------
//  Package creation tasks
//=======================================================================================
var packageItems = CreateItemCollection(PackgeSrcDir, "/**/*", PackageDir);

Task("PlacePackage")
    .WithCriteria(() => packageItems.IsStaled())
    .Does(() => packageItems.CopyFromSourceToTarget());

Task("Sign")
    .IsDependentOn("PlacePackage")
    .WithCriteria(SignApp)
    .WithCriteria(() => compiledAppItems.IsStaled())
    .Does(() => {
        // Create a ZXP file.
        
        Information("Signing App at {0}", CompiledAppDir);
        EnsureDeleteFile(SignedAppZxp);
        RunProcess(BuildConfig.ZxpSignCmd, "-sign",
            NormalizePath(CompiledAppDir),
            NormalizePath(SignedAppZxp),
            NormalizePath(BuildConfig.CertFile),
            FileReadText(BuildConfig.PassFile),
            "-tsa https://timestamp.geotrust.com/tsa");
        
        // Extract to signed-app directory.
        CleanDirectory(SignedAppDir);
        ZipUncompress(SignedAppZxp, SignedAppDir);
    });

ItemCollection publishSrcItems;
ItemCollection publishTgtItems;

Task("PrepareForPublish")
    .IsDependentOn("Sign")
    .WithCriteria(PublishPackage)
    .Does(() => {
        publishSrcItems = CreateItemCollection(PackageDir, "/**/*");
        publishTgtItems = CreateItemCollection();
        var ver = BuildConfig.PackageVersion.ToString().Replace(".", "_");
        publishTgtItems.Include(string.Format("{0}/{1}_{2}.zip", DistDir, AppName, ver));
    });

Task("Publish")
    .IsDependentOn("PrepareForPublish")
    .WithCriteria(PublishPackage)
    .WithCriteria(() => IsStaled(publishSrcItems, publishTgtItems))
    .Does(() => {
        ZipCompress(PackageDir, publishTgtItems.First().Path);
    });

Task("Deploy")
    .Does(() => {

    });

Task("Default")
    .IsDependentOn("Clean")
    .IsDependentOn("Compile")
    .IsDependentOn("Publish")
    .Does(() => {
    });

RunTarget(Target);
