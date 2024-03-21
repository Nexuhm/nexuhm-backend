import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import { firstValueFrom, throwError } from 'rxjs';
import * as querystring from 'querystring';
import { catchError } from 'rxjs/operators';

@Injectable()
export class VideoAnalysisService {
  constructor(private httpService: HttpService) {}

  private readonly accountId = process.env.AZURE_VIDEO_INDEXER_ACCOUNT_ID;
  private readonly location = process.env.AZURE_VIDEO_INDEXER_LOCATION;

  async getOauthAccessToken(): Promise<string> {
    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const clientId = process.env.MICROSOFT_VIDEO_INDEXER_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_VIDEO_INDEXER_CLIENT_SECRET;
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = {
      client_id: clientId,
      scope: 'https://management.azure.com/.default',
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, querystring.stringify(data), {
          headers,
        }),
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw new Error('Failed to retrieve access token');
    }
  }

  async getAccessToken(): Promise<string> {
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    const accountName = process.env.AZURE_VIDEO_INDEXER_ACCOUNT_NAME;
    const resourceGroupName =
      process.env.AZURE_VIDEO_INDEXER_RESOURCE_GROUP_NAME;
    const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.VideoIndexer/accounts/${accountName}/generateAccessToken?api-version=2024-01-01`;

    const requestBody = {
      scope: 'Account',
      permissionType: 'Contributor',
    };

    const token = await this.getOauthAccessToken();

    const tokenResponse = await firstValueFrom(
      this.httpService.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return tokenResponse.data.accessToken;
  }

  async uploadVideo(
    accessToken: string,
    videoBuffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const url = `https://api.videoindexer.ai/${this.location}/Accounts/${
      this.accountId
    }/Videos?name=${encodeURIComponent(
      fileName,
    )}&privacy=private&partition=some_partition`;
    const formData = new FormData();
    formData.append('file', videoBuffer, fileName);

    const response = await firstValueFrom(
      this.httpService
        .post(url, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${accessToken}`, // Use Bearer token for ARM-based accounts
          },
        })
        .pipe(
          catchError((err) => {
            console.error('Error during video upload:', err);
            return throwError(() => err);
          }),
        ),
    );

    return response.data.id; // Video ID
  }

  async getVideoIndex(accessToken: string, videoId: string): Promise<any> {
    const url = `https://api.videoindexer.ai/${this.location}/Accounts/${this.accountId}/Videos/${videoId}/Index?accessToken=${accessToken}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  async getVideoCaptions(videoId: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const url = `https://api.videoindexer.ai/${this.location}/Accounts/${this.accountId}/Videos/${videoId}/Captions?accessToken=${accessToken}&format=Txt`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  async startVideoProcessing(
    videoBuffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const accessToken = await this.getAccessToken();
    return await this.uploadVideo(accessToken, videoBuffer, fileName);
  }
}
