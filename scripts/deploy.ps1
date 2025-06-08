# 定义颜色函数
function Write-ColorOutput {
    param($ForegroundColor)
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# 打印分隔线
function Write-Separator {
    Write-ColorOutput -ForegroundColor Cyan "========================================"
}

# 打印标题
function Write-Title {
    param([string]$Title)
    Write-Separator
    Write-ColorOutput -ForegroundColor Yellow $Title
    Write-Separator
}

# 打印成功信息
function Write-Success {
    param([string]$Message)
    Write-ColorOutput -ForegroundColor Green "[SUCCESS] $Message"
}

# 打印错误信息
function Write-Error {
    param([string]$Message)
    Write-ColorOutput -ForegroundColor Red "[ERROR] $Message"
}

# 打印警告信息
function Write-Warning {
    param([string]$Message)
    Write-ColorOutput -ForegroundColor Yellow "[WARNING] $Message"
}

# 打印信息
function Write-Info {
    param([string]$Message)
    Write-ColorOutput -ForegroundColor Cyan "[INFO] $Message"
}

# 获取脚本所在目录的父目录（项目根目录）
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# 检查是否以管理员权限运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning -Message "请以管理员权限运行此脚本"
    Write-Info -Message "请右键点击 PowerShell，选择'以管理员身份运行'"
    exit 1
}

# 构建项目
Write-Title -Title "开始构建项目"
Write-Info -Message "运行 npm run build..."
try {
    Set-Location -Path $PROJECT_ROOT
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "构建失败"
    }
    Write-Success -Message "构建成功！"
}
catch {
    Write-Error -Message "构建失败，请检查错误信息"
    exit 1
}

# 目标目录
$TARGET_DIR = "C:\inetpub\wwwroot\agricultural-diagnostic-web"

# 检查目标目录是否存在
Write-Title -Title "检查目标目录"
Write-Info -Message "目标目录: $TARGET_DIR"
if (-not (Test-Path -Path $TARGET_DIR)) {
    Write-Warning -Message "目标目录不存在，正在创建..."
    try {
        New-Item -ItemType Directory -Path $TARGET_DIR -Force | Out-Null
        Write-Success -Message "目标目录创建完成！"
    }
    catch {
        Write-Error -Message "创建目录失败：$_"
        exit 1
    }
}
else {
    Write-Info -Message "目标目录已存在。"
}

# 清空目标目录
Write-Title -Title "清空目标目录"
Write-Info -Message "正在清空目标目录..."
try {
    Get-ChildItem -Path $TARGET_DIR -Recurse | Remove-Item -Force -Recurse
    Write-Success -Message "目标目录已清空！"
}
catch {
    Write-Error -Message "清空目录失败：$_"
    exit 1
}

# 复制文件
Write-Title -Title "复制文件到目标目录"
Write-Info -Message "正在复制文件..."
try {
    Copy-Item -Path "$PROJECT_ROOT\dist\*" -Destination $TARGET_DIR -Recurse -Force
    Write-Success -Message "文件复制完成！"
}
catch {
    Write-Error -Message "复制文件失败：$_"
    exit 1
}

# 设置权限
Write-Title -Title "设置文件权限"
Write-Info -Message "正在设置权限..."
try {
    $acl = Get-Acl -Path $TARGET_DIR
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $TARGET_DIR -AclObject $acl
    Write-Success -Message "权限设置完成！"
}
catch {
    Write-Error -Message "设置权限失败：$_"
    exit 1
}

Write-Title -Title "部署完成"
Write-Success -Message "项目已成功部署到 $TARGET_DIR"

# 提示重启 IIS
Write-Info -Message "建议重启 IIS 以确保更改生效"
$restartIIS = Read-Host "是否要重启 IIS？(Y/N)"
if ($restartIIS -eq "Y" -or $restartIIS -eq "y") {
    Write-Info -Message "正在重启 IIS..."
    try {
        iisreset
        Write-Success -Message "IIS 重启完成！"
    }
    catch {
        Write-Error -Message "重启 IIS 失败：$_"
    }
} 