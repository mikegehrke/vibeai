# VibeAI Code Studio

**Production-Grade Multi-Language Code Execution Environment**

## Features

✅ **Multi-Language Support**
- Python 3.9+
- JavaScript (Node.js 18+)
- TypeScript 5.0+
- Dart 3.0+
- Swift 5.8+
- Kotlin 1.8+
- Java 17+
- C# (.NET 7+)

✅ **Security**
- Sandboxed execution
- Timeout protection (30s default)
- Memory limits (512MB default)
- Isolated temp environments
- Output sanitization

✅ **Project Management**
- Create/delete projects
- File CRUD operations
- Project metadata tracking
- User isolation

✅ **Billing Integration**
- Rate limiting per tier (Free/Pro/Ultra/Enterprise)
- Cost tracking
- Usage analytics
- Execution quotas

✅ **API Endpoints**

### Code Execution
```
POST /codestudio/run
{
  "language": "python",
  "code": "print('Hello World')",
  "project_id": "optional",
  "stdin": "optional input"
}
```

### Project Management
```
POST /codestudio/project/create
GET  /codestudio/project/list
GET  /codestudio/project/{project_id}
DELETE /codestudio/project/{project_id}
```

### File Operations
```
POST /codestudio/file/create
GET  /codestudio/file/read?project_id=&filename=
POST /codestudio/file/update
GET  /codestudio/file/list?project_id=
POST /codestudio/file/delete
```

### System Info
```
GET /codestudio/languages  # List supported languages
GET /codestudio/stats      # User statistics
```

## Architecture

```
codestudio/
├── routes.py              # FastAPI endpoints
├── executor.py            # Main execution engine
├── sandbox.py             # Secure execution environment
├── project_manager.py     # Project CRUD
├── file_manager.py        # File CRUD
├── output_cleaner.py      # Output sanitization
└── languages/             # Language executors
    ├── python_executor.py
    ├── javascript_executor.py
    ├── typescript_executor.py
    ├── dart_executor.py
    ├── swift_executor.py
    ├── kotlin_executor.py
    ├── java_executor.py
    └── csharp_executor.py
```

## Usage Example

```python
# Execute Python code
response = await client.post("/codestudio/run", json={
    "language": "python",
    "code": """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
"""
})

# Response
{
    "status": "success",
    "stdout": "F(0) = 0\nF(1) = 1\nF(2) = 1\n...",
    "stderr": "",
    "execution_time": 0.123,
    "language": "python",
    "returncode": 0
}
```

## Security Considerations

1. **Timeout Protection**: All executions have 30-second timeout
2. **Memory Limits**: 512MB memory limit per execution
3. **Isolated Environments**: Each execution runs in temporary directory
4. **Output Sanitization**: ANSI codes and control characters removed
5. **Rate Limiting**: Billing-tier based execution quotas
6. **User Isolation**: Projects separated by user email

## Integration

### With Cora Agent (Coding AI)
```python
# Cora generates code
code = await cora_agent.run("Write a Python function to sort array")

# Execute in Code Studio
result = await execute_code(
    language="python",
    code=code["response"],
    user_email=user.email
)
```

### With Billing System
```python
# Rate limit check before execution
await limiter.enforce(
    user=user.email,
    tier=user.tier,
    feature="code_studio",
    cost_estimate=0.01
)

# Usage recorded automatically in UsageRecordDB
```

## Requirements

### System Dependencies
- Python 3.9+
- Node.js 18+ (for JavaScript/TypeScript)
- Dart SDK 3.0+ (for Dart)
- Swift 5.8+ (for Swift - macOS/Linux)
- Kotlin 1.8+ (for Kotlin)
- Java JDK 17+ (for Java)
- .NET 7+ (for C#)
- ts-node (for TypeScript)

### Python Packages
```bash
pip install fastapi sqlalchemy
```

## Production Deployment

1. **Docker Container** (recommended)
   - Isolate language runtimes
   - Resource limits enforced by container
   - Easy scaling

2. **Resource Monitoring**
   - Track CPU/memory usage per execution
   - Alert on anomalies
   - Auto-kill runaway processes

3. **Logging**
   - All executions logged
   - Error tracking
   - Performance metrics

4. **Backup & Recovery**
   - Regular backup of user projects
   - Auto-recovery from failures

## Future Enhancements

- [ ] WebSocket streaming output
- [ ] Collaborative coding (multi-user)
- [ ] Code review integration
- [ ] Git integration
- [ ] Package manager support (pip, npm, pub)
- [ ] Debugging support
- [ ] Performance profiling
- [ ] Code coverage reports
- [ ] Language server protocol (LSP) integration
- [ ] VS Code extension integration

---

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Generated**: 2025-12-02
