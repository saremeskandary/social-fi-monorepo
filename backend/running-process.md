deploy

```
chmod +x deploy.sh
./deploy.sh
```
```
sudo killall dfx
sudo killall icx-proxy
sudo killall replica
rm -rf .dfx
dfx start --clean --background
dfx deploy
```

test
```
dfx start --clean --background
dfx deploy social_media_dapp_test
dfx canister call social_media_dapp_test runAllTests
```


Based on the error, it seems the deployment is failing because the Social Media DApp canister requires a valid principal ID (UserManager canister ID) as an initialization argument, but received "a" instead. Let me help you fix this.



```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Terminal, CheckCircle2 } from 'lucide-react';

const DeploymentInstructions = () => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Social Media DApp Deployment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Error Resolution
          </h3>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md text-sm">
            The error occurs because the social_media_dapp canister needs the user_manager canister ID 
            as an initialization argument, but received &quot;a&quot; instead.
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Deployment Steps
          </h3>
          <div className="space-y-4 text-sm">
            <ol className="list-decimal list-inside space-y-3">
              <li>First, clean up the existing deployment:
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                  {`sudo killall dfx
sudo killall icx-proxy
sudo killall replica
rm -rf .dfx`}
                </pre>
              </li>
              
              <li>Start the local network:
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                  dfx start --clean --background
                </pre>
              </li>
              
              <li>Deploy the user_manager canister first:
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                  dfx deploy user_manager
                </pre>
              </li>
              
              <li>Get the user_manager canister ID:
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                  dfx canister id user_manager
                </pre>
              </li>
              
              <li>Deploy the social_media_dapp canister with the user_manager canister ID:
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                  {`# Replace USER_MANAGER_ID with the actual canister ID from step 4
dfx deploy social_media_dapp --argument '("USER_MANAGER_ID")'`}
                </pre>
              </li>
              
              <li>Finally, deploy the test canister:
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                  dfx deploy social_media_dapp_test
                </pre>
              </li>
            </ol>
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md">
          <strong>Note:</strong> Make sure to replace USER_MANAGER_ID with the actual canister ID 
          obtained from step 4. The canister ID will look something like &quot;be2us-64aaa-aaaaa-qaabq-cai&quot;.
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentInstructions;

```

1. Clean up the current deployment:
```bash
sudo killall dfx
sudo killall icx-proxy
sudo killall replica
rm -rf .dfx
```

1. Start the local network:
```bash
dfx start --clean --background
```

1. Deploy the user_manager canister first:
```bash
dfx deploy user_manager
```

1. Get the user_manager canister ID:
```bash
dfx canister id user_manager
```

1. Deploy the social_media_dapp canister with the user_manager canister ID:
```bash
# Replace be2us-64aaa-aaaaa-qaabq-cai with your actual user_manager canister ID
dfx deploy social_media_dapp --argument '("be2us-64aaa-aaaaa-qaabq-cai")'
```

1. Finally, deploy the test canister:
```bash
dfx deploy social_media_dapp_test
```