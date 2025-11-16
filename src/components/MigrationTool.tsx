import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Database, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import * as migrationService from "../services/migrationService";

export function MigrationTool() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    stage: string;
    current: number;
    total: number;
    message: string;
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    summary?: {
      users: number;
      events: number;
      registrations: number;
      favorites: number;
      follows: number;
    };
    errors?: string[];
  } | null>(null);
  const [hasMigrated, setHasMigrated] = useState<boolean | null>(null);

  // 检查是否已迁移
  const checkMigrationStatus = async () => {
    const result = await migrationService.checkIfMigrated();
    if (result.success) {
      setHasMigrated(result.hasMigrated);
    } else {
      toast.error('检查迁移状态失败', { description: result.error });
    }
  };

  // 执行迁移
  const handleMigrate = async () => {
    if (isMigrating) return;

    setIsMigrating(true);
    setMigrationResult(null);
    setMigrationProgress(null);

    try {
      const result = await migrationService.runFullMigration((progress) => {
        setMigrationProgress(progress);
      });

      setMigrationResult(result);

      if (result.success) {
        toast.success('迁移完成！', {
          description: `成功迁移: ${result.summary?.users || 0} 个用户, ${result.summary?.events || 0} 个活动`
        });
        setHasMigrated(true);
      }
    } catch (error) {
      console.error('迁移失败:', error);
      toast.error('迁移失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // 清除 localStorage
  const handleClearLocalStorage = () => {
    if (!confirm('确定要清除所有 localStorage 数据吗？此操作不可逆！')) {
      return;
    }

    migrationService.clearLocalStorageData();
    toast.success('localStorage 数据已清除');
  };

  // 计算进度百分比
  const getProgressPercentage = () => {
    if (!migrationProgress) return 0;
    if (migrationProgress.total === 0) return 0;
    return Math.round((migrationProgress.current / migrationProgress.total) * 100);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          数据迁移工具
        </CardTitle>
        <CardDescription>
          将 localStorage 数据迁移到 Supabase 数据库
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 迁移状态检查 */}
        <div className="space-y-2">
          <Button
            onClick={checkMigrationStatus}
            variant="outline"
            size="sm"
            disabled={isMigrating}
          >
            检查迁移状态
          </Button>
          {hasMigrated !== null && (
            <Alert variant={hasMigrated ? "default" : "destructive"}>
              {hasMigrated ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {hasMigrated ? '数据库已有数据' : '数据库为空'}
              </AlertTitle>
              <AlertDescription>
                {hasMigrated
                  ? '检测到数据库已有用户数据，可能已经迁移过。'
                  : '数据库中没有用户数据，可以开始迁移。'
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 迁移进度 */}
        {isMigrating && migrationProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{migrationProgress.stage}</span>
              <span className="text-gray-500">
                {migrationProgress.current} / {migrationProgress.total}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-sm text-gray-600">{migrationProgress.message}</p>
          </div>
        )}

        {/* 迁移结果 */}
        {migrationResult && (
          <Alert variant={migrationResult.success ? "default" : "destructive"}>
            {migrationResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {migrationResult.success ? '迁移成功' : '迁移失败'}
            </AlertTitle>
            <AlertDescription>
              {migrationResult.summary && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>✅ 用户: {migrationResult.summary.users} 个</p>
                  <p>✅ 活动: {migrationResult.summary.events} 个</p>
                  <p>✅ 报名记录: {migrationResult.summary.registrations} 条</p>
                  <p>✅ 收藏记录: {migrationResult.summary.favorites} 条</p>
                  <p>✅ 关注记录: {migrationResult.summary.follows} 条</p>
                </div>
              )}
              {migrationResult.errors && migrationResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">警告:</p>
                  <ul className="list-disc list-inside text-xs">
                    {migrationResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {migrationResult.errors.length > 5 && (
                      <li>... 还有 {migrationResult.errors.length - 5} 个警告</li>
                    )}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 使用说明 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>使用说明</AlertTitle>
          <AlertDescription className="text-sm space-y-1">
            <p>1. 确保已在 Supabase Dashboard 中执行了数据库 Schema SQL 脚本</p>
            <p>2. 点击"开始迁移"将 localStorage 数据导入数据库</p>
            <p>3. 迁移完成后，可选择清除 localStorage 数据</p>
            <p className="text-orange-600 font-medium">⚠️ 迁移前请确保数据库 Schema 已创建！</p>
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          onClick={handleMigrate}
          disabled={isMigrating}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isMigrating ? '迁移中...' : '开始迁移'}
        </Button>

        <Button
          onClick={handleClearLocalStorage}
          disabled={isMigrating}
          variant="outline"
          className="text-red-600 hover:text-red-700"
        >
          清除 localStorage
        </Button>
      </CardFooter>
    </Card>
  );
}
