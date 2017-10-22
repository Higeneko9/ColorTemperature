using Cake.Core;
using Cake.Core.Annotations;
using SysIO = System.IO;

//---------------------------------------------------------------------------------------
//=======================================================================================
public class Item
{
    public string Path
    {
        get { return GetMetadata("Path"); }
        set { SetMetadata("Path", value); }
    }

    public string SourcePath
    {
        get { return GetMetadata("SourcePath"); }
        set { SetMetadata("SourcePath", value); }
    }

    public string TargetPath
    {
        get { return GetMetadata("TargetPath"); }
        set { SetMetadata("TargetPath", value); }
    }

    public bool IsStaled
    {
        get {
            return SysIO.File.Exists(TargetPath) == false ||
                SysIO.File.GetLastWriteTime(TargetPath) < SysIO.File.GetLastWriteTime(SourcePath);
        }
    }

    public Dictionary<string, string> Metadata { get; private set; }

    public Item()
    {
        Metadata = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase);
    }

    public Item(string path) : this()
    {
        Path = SourcePath = path;
    }

    public Item(string path, string targetPath) : this()
    {
        Path = SourcePath = path;
        TargetPath = targetPath;
    }

    public void SetMetadata(string name, string value)
    {
        if (Metadata.ContainsKey(name))
        {
            Metadata[name] = value;
        }
        else
        {
            Metadata.Add(name, value);
        }
    }

    public string GetMetadata(string name)
    {
        return Metadata.ContainsKey(name) ? Metadata[name] : string.Empty;
    }
}

public class ItemCollection : ICollection<Item>
{
    public string SourceDirectory {get; set;}

    public string TargetDirectory {get; set;}

    public ICakeContext Context {get; private set;}

    public ItemCollection(ICakeContext context)
    {
        Context = context;
    }

    public ItemCollection(ICakeContext context, string srcDir, string pattern, string targetDir,
        string newExtension = null, Func<string, string, string> filter = null)
    {
        Context = context;
        Include(srcDir, pattern, targetDir, newExtension, filter);
    }

    public ItemCollection(ICakeContext context, string srcDir, string pattern, Func<string, string, string> filter = null)
    {
        Context = context;
        Include(srcDir, pattern, filter);
    }

    public ItemCollection Include(string srcDir, string pattern, string targetDir,
        string newExtension = null,
        Func<string, string, string> filter = null)
    {
        var srcDirPath = new DirectoryPath(srcDir).MakeAbsolute(Context.Environment);
        var tgtDirPath = new DirectoryPath(targetDir).MakeAbsolute(Context.Environment);

        Context.Verbose("#### Create Item Collection in {0}. Patterh:{1}", srcDirPath, pattern);

        SourceDirectory = srcDirPath.FullPath;
        TargetDirectory = tgtDirPath.FullPath;
    
        foreach(var curFilePath in Context.GetFiles(srcDirPath + pattern))
        {
            var filePath = curFilePath;
            var targetPath = tgtDirPath.CombineWithFilePath(srcDirPath.GetRelativePath(filePath));
            var srcRelativePath = srcDirPath.GetRelativePath(filePath);

            if (filter != null)
            {
                var newFilename = filter(filePath.FullPath, srcRelativePath.FullPath);
                if (string.IsNullOrEmpty(newFilename))
                {
                    Context.Verbose("Ignored: {0}", filePath);

                    continue;
                }

                var newFilePath = FilePath.FromString(newFilename).MakeAbsolute(srcDirPath);
                srcRelativePath = srcDirPath.GetRelativePath(newFilePath);
                targetPath = tgtDirPath.CombineWithFilePath(srcRelativePath);
            }

            if (string.IsNullOrEmpty(newExtension) == false)
            {
                targetPath = targetPath.ChangeExtension(newExtension);
            }

            Context.Verbose("Include: {0} -> {1}", filePath.FullPath, targetPath.FullPath);
            _items.Add(new Item(filePath.FullPath, targetPath.FullPath));
        }

        return this;
    }

    public ItemCollection Include(string srcDir, string pattern, Func<string, string, string> filter = null)
    {
        var srcDirPath = new DirectoryPath(srcDir).MakeAbsolute(Context.Environment);

        SourceDirectory = srcDirPath.FullPath;
    
        foreach(var curFilePath in Context.GetFiles(srcDirPath + pattern))
        {
            var filePath = curFilePath;
 
            if (filter != null)
            {
                var newFilename = filter(filePath.FullPath, filePath.GetFilename().FullPath);
                if (string.IsNullOrEmpty(newFilename))
                {
                    continue;
                }
            }

            _items.Add(new Item(filePath.FullPath));
        }

        return this;
    }

    public ItemCollection Include(string path)
    {
        _items.Add(new Item(path));
        return this;
    }

    public void CopyFromSourceToTarget()
    {
        foreach(var item in _items)
        {
            if (item.IsStaled)
            {
                Context.EnsureDirectoryExists(new FilePath(item.TargetPath).GetDirectory());
                Context.CopyFile(item.SourcePath, item.TargetPath);
            }
        }
    }

    public bool IsStaled()
    {
        return _items.Any(o => o.IsStaled);
    }

    #region ICollection implementas

    public int Count { get { return _items.Count; } }

    public bool IsReadOnly { get { return false; } }

    public void Add(Item item)
    {
        _items.Add(item);
    }

    public void Clear()
    {
        _items.Clear();
    }

    public bool Contains(Item item)
    {
        return _items.Contains(item);
    }

    public void CopyTo(Item[] array, int arrayIndex)
    {
        throw new NotImplementedException();
    }

    public bool Remove(Item item)
    {
        return _items.Remove(item);
    }

    public IEnumerator<Item> GetEnumerator()
    {
        return _items.GetEnumerator();
    }

    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
    {
        return _items.GetEnumerator();
    }

    private readonly List<Item> _items = new List<Item>();

    #endregion
}

ItemCollection CreateItemCollection()
{
    return new ItemCollection(Context);
}


ItemCollection CreateItemCollection(string srcDir, string pattern, Func<string, string, string> filter = null)
{
    return new ItemCollection(Context, srcDir, pattern, filter);
}

ItemCollection CreateItemCollection(string srcDir, string pattern, string targetDir,
        string newExtension = null, Func<string, string, string> filter = null)
{
    return new ItemCollection(Context, srcDir, pattern, targetDir, newExtension, filter);
}

bool IsStaled(ItemCollection inputs, ItemCollection outputs)
{
    var recentInputTimeStamp = inputs.Max(a => SysIO.File.GetLastWriteTime(a.Path));
    return outputs.Any(a => SysIO.File.Exists(a.Path) == false || SysIO.File.GetLastWriteTime(a.Path) < recentInputTimeStamp);
}

//---------------------------------------------------------------------------------------
//=======================================================================================
string[] RunProcess(string command, params string[] args)
{
    string[] result;

    var settings = new ProcessSettings
    {
        Arguments = string.Join(" ", args),
    };

    using (var proc = StartAndReturnProcess(command, settings))
    {
        proc.WaitForExit();
        if (proc.GetExitCode() != 0)
        {
            throw new Exception(string.Format("RunProcess failed.\r\n{0} {1}", command, settings.Arguments.Render()));
        }
        result = proc.GetStandardOutput().ToArray();
    }

    return result;
}

public string NormalizePath(string path)
{
    return Context.Environment.Platform.IsUnix()? path: path.Replace("/", "\\");
}

void EnsureDeleteFile(string path)
{
    if (FileExists(path))
    {
        DeleteFile(path);
    }
}

